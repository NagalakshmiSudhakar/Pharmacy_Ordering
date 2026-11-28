import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import {
  OrderResponse,
  OrderStatus,
  PaymentRecord,
  getOrderStatusClass,
  getOrderStatusLabel,
  getOrderStep
} from '../../../models/order.model';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.css'
})
export class CustomerOrdersComponent implements OnInit {
  orders = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  actionMessage = signal<string>('');
  selectedFilter = signal<number | 'All'>('All');
  cancellingId = signal<number | null>(null);
  confirmCancelId = signal<number | null>(null);

  OrderStatus = OrderStatus;

  readonly progressSteps = [
    { step: 1, label: 'Pending' },
    { step: 2, label: 'Confirmed' },
    { step: 3, label: 'Processing' },
    { step: 4, label: 'Shipped' },
    { step: 5, label: 'Delivered' }
  ];

  readonly statusFilters: { label: string; value: number | 'All' }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: OrderStatus.Pending },
    { label: 'Confirmed', value: OrderStatus.Confirmed },
    { label: 'Processing', value: OrderStatus.Processing },
    { label: 'Shipped', value: OrderStatus.Shipped },
    { label: 'Delivered', value: OrderStatus.Delivered },
    { label: 'Cancelled', value: OrderStatus.Cancelled }
  ];

  filteredOrders = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'All') {
      return this.orders();
    }
    return this.orders().filter((o) => o.orderStatus === filter);
  });

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Unable to load your orders.'
        );
        this.isLoading.set(false);
      }
    });
  }

  canCancel(order: OrderResponse): boolean {
    return (
      order.orderStatus === OrderStatus.Pending ||
      order.orderStatus === OrderStatus.Confirmed
    );
  }

  requestCancel(orderId: number): void {
    this.confirmCancelId.set(orderId);
  }

  abortCancel(): void {
    this.confirmCancelId.set(null);
  }

  confirmCancel(orderId: number): void {
    this.cancellingId.set(orderId);
    this.errorMessage.set('');
    this.actionMessage.set('');

    this.orderService.cancelOrder(orderId).subscribe({
      next: (updated) => {
        this.cancellingId.set(null);
        this.confirmCancelId.set(null);
        this.orders.update((list) =>
          list.map((o) => (o.orderId === orderId ? updated : o))
        );
        this.actionMessage.set(`Order #${orderId} has been cancelled.`);
      },
      error: (err) => {
        this.cancellingId.set(null);
        this.confirmCancelId.set(null);
        this.errorMessage.set(
          err.error?.message || 'Could not cancel this order.'
        );
      }
    });
  }

  getPayment(orderId: number): PaymentRecord | null {
    return this.paymentService.getPaymentForOrder(orderId);
  }

  statusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  statusClass(status: OrderStatus): string {
    return getOrderStatusClass(status);
  }

  orderStep(status: OrderStatus): number {
    return getOrderStep(status);
  }
}
