import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import {
  OrderResponse,
  OrderStatus,
  getOrderStatusClass,
  getOrderStatusLabel
} from '../../../models/order.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboardComponent implements OnInit {
  orders = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  totalOrders = computed(() => this.orders().length);
  activeOrders = computed(() =>
    this.orders().filter(
      (o) =>
        o.orderStatus !== OrderStatus.Delivered &&
        o.orderStatus !== OrderStatus.Cancelled
    ).length
  );
  totalSpent = computed(() =>
    this.orders()
      .filter((o) => o.orderStatus !== OrderStatus.Cancelled)
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );
  recentOrders = computed(() => this.orders().slice(0, 5));

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private orderService: OrderService
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
      error: () => {
        this.errorMessage.set('Unable to load your recent orders.');
        this.isLoading.set(false);
      }
    });
  }

  statusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  statusClass(status: OrderStatus): string {
    return getOrderStatusClass(status);
  }
}
