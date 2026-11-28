import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import {
  OrderResponse,
  PaymentMethod,
  PaymentRecord
} from '../../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  checkoutForm;
  selectedMethod = signal<PaymentMethod>('Card');
  isProcessing = signal<boolean>(false);
  errorMessage = signal<string>('');
  placedOrder = signal<OrderResponse | null>(null);
  paymentReceipt = signal<PaymentRecord | null>(null);

  banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {
    const user = this.authService.getUser();
    this.checkoutForm = this.fb.group({
      fullName: [user?.fullName || '', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      cardHolder: [user?.fullName || ''],
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: [''],
      upiId: [''],
      bankName: ['State Bank of India']
    });
  }

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({ error: () => {} });
    this.applyPaymentValidators('Card');
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.errorMessage.set('');
    this.applyPaymentValidators(method);
  }

  private applyPaymentValidators(method: PaymentMethod): void {
    const cardHolder = this.checkoutForm.get('cardHolder')!;
    const cardNumber = this.checkoutForm.get('cardNumber')!;
    const cardExpiry = this.checkoutForm.get('cardExpiry')!;
    const cardCvv = this.checkoutForm.get('cardCvv')!;
    const upiId = this.checkoutForm.get('upiId')!;
    const bankName = this.checkoutForm.get('bankName')!;

    [cardHolder, cardNumber, cardExpiry, cardCvv, upiId, bankName].forEach((c) => {
      c.clearValidators();
    });

    if (method === 'Card') {
      cardHolder.setValidators([Validators.required, Validators.minLength(2)]);
      cardNumber.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{16}$/)
      ]);
      cardExpiry.setValidators([
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)
      ]);
      cardCvv.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{3,4}$/)
      ]);
    } else if (method === 'UPI') {
      upiId.setValidators([
        Validators.required,
        Validators.pattern(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/)
      ]);
    } else if (method === 'NetBanking') {
      bankName.setValidators([Validators.required]);
    }

    [cardHolder, cardNumber, cardExpiry, cardCvv, upiId, bankName].forEach((c) => {
      c.updateValueAndValidity();
    });
  }

  placeAndPayOrder(): void {
    if (this.cartService.cartItems().length === 0) {
      this.errorMessage.set('Your cart is empty. Add medicines before checking out.');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isProcessing.set(true);

    const form = this.checkoutForm.getRawValue();
    const method = this.selectedMethod();

    this.orderService.placeOrder().subscribe({
      next: (order) => {
        const record: PaymentRecord = {
          orderId: order.orderId,
          transactionId: this.paymentService.generateTransactionId(method),
          paymentMethod: method,
          paymentStatus: method === 'COD' ? 'Pending on Delivery' : 'Paid',
          amount: order.totalAmount,
          paidAt: new Date().toISOString(),
          deliveryName: form.fullName!.trim(),
          deliveryPhone: form.phoneNumber!.trim(),
          deliveryAddress: form.streetAddress!.trim(),
          city: form.city!.trim(),
          pincode: form.pincode!.trim(),
          paymentSummary: this.buildPaymentSummary(method, form)
        };

        this.paymentService.savePaymentRecord(record);
        this.paymentReceipt.set(record);
        this.placedOrder.set(order);
        this.cartService.loadCart().subscribe({ error: () => {} });
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(
          err.error?.message || 'Unable to place order. Please check stock and try again.'
        );
      }
    });
  }

  private buildPaymentSummary(
    method: PaymentMethod,
    form: ReturnType<typeof this.checkoutForm.getRawValue>
  ): string {
    switch (method) {
      case 'Card': {
        const num = form.cardNumber || '';
        return `Card ending in ${num.slice(-4)}`;
      }
      case 'UPI':
        return `UPI (${form.upiId})`;
      case 'NetBanking':
        return `Net Banking (${form.bankName})`;
      case 'COD':
        return 'Cash on Delivery';
    }
  }
}
