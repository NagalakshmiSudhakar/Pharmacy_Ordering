import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  busyItemId = signal<number | null>(null);
  isClearing = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      error: () => {
        this.errorMessage.set('Unable to load your cart.');
      }
    });
  }

  changeQuantity(item: CartItem, delta: number): void {
    const nextQty = item.quantity + delta;
    if (nextQty < 1 || nextQty > 100) {
      return;
    }

    this.errorMessage.set('');
    this.busyItemId.set(item.cartItemId);

    this.cartService.updateCartItem(item.cartItemId, nextQty).subscribe({
      next: () => {
        this.busyItemId.set(null);
      },
      error: (err) => {
        this.busyItemId.set(null);
        this.errorMessage.set(
          err.error?.message || 'Could not update item quantity.'
        );
      }
    });
  }

  removeItem(item: CartItem): void {
    this.errorMessage.set('');
    this.busyItemId.set(item.cartItemId);

    this.cartService.removeCartItem(item.cartItemId).subscribe({
      next: () => {
        this.busyItemId.set(null);
      },
      error: (err) => {
        this.busyItemId.set(null);
        this.errorMessage.set(
          err.error?.message || 'Could not remove item from cart.'
        );
      }
    });
  }

  clearCart(): void {
    this.errorMessage.set('');
    this.isClearing.set(true);

    this.cartService.clearCart().subscribe({
      next: () => {
        this.isClearing.set(false);
      },
      error: (err) => {
        this.isClearing.set(false);
        this.errorMessage.set(err.error?.message || 'Could not clear cart.');
      }
    });
  }
}
