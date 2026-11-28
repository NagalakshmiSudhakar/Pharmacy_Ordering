import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import {
  OrderResponse,
  OrderStatus,
  PaymentRecord,
  getOrderStatusClass,
  getOrderStatusLabel
} from '../../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  searchTerm = signal<string>('');
  selectedFilter = signal<number | 'All'>('All');
  pendingStatusMap = signal<Record<number, OrderStatus>>({});
  updatingOrderId = signal<number | null>(null);
  expandedOrderId = signal<number | null>(null);

  OrderStatus = OrderStatus;

  readonly statusFilters: { label: string; value: number | 'All' }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: OrderStatus.Pending },
    { label: 'Confirmed', value: OrderStatus.Confirmed },
    { label: 'Processing', value: OrderStatus.Processing },
    { label: 'Shipped', value: OrderStatus.Shipped },
    { label: 'Delivered', value: OrderStatus.Delivered },
    { label: 'Cancelled', value: OrderStatus.Cancelled }
  ];

  // Admin cannot set Cancelled via UpdateOrderStatus endpoint
  readonly updatableStatuses: { label: string; value: OrderStatus }[] = [
    { label: 'Pending', value: OrderStatus.Pending },
    { label: 'Confirmed', value: OrderStatus.Confirmed },
    { label: 'Processing', value: OrderStatus.Processing },
    { label: 'Shipped', value: OrderStatus.Shipped },
    { label: 'Delivered', value: OrderStatus.Delivered }
  ];

  filteredOrders = computed(() => {
    const filter = this.selectedFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.orders().filter((o) => {
      const statusMatch = filter === 'All' || o.orderStatus === filter;
      const searchMatch =
        !term ||
        String(o.orderId).includes(term) ||
        o.userId.toLowerCase().includes(term) ||
        o.orderItems.some((item) =>
          item.medicineName.toLowerCase().includes(term)
        );
      return statusMatch && searchMatch;
    });
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

    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        const map: Record<number, OrderStatus> = {};
        for (const o of data) {
          map[o.orderId] = o.orderStatus;
        }
        this.pendingStatusMap.set(map);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Unable to load orders.'
        );
        this.isLoading.set(false);
      }
    });
  }

  getSelectedStatus(order: OrderResponse): OrderStatus {
    return this.pendingStatusMap()[order.orderId] ?? order.orderStatus;
  }

  onStatusSelect(orderId: number, value: string | number): void {
    const parsed = Number(value) as OrderStatus;
    this.pendingStatusMap.update((m) => ({ ...m, [orderId]: parsed }));
  }

  isLocked(order: OrderResponse): boolean {
    return (
      order.orderStatus === OrderStatus.Delivered ||
      order.orderStatus === OrderStatus.Cancelled
    );
  }

  updateStatus(order: OrderResponse): void {
    const nextStatus = this.getSelectedStatus(order);
    if (nextStatus === order.orderStatus || this.isLocked(order)) {
      return;
    }

    this.updatingOrderId.set(order.orderId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.orderService.updateOrderStatus(order.orderId, nextStatus).subscribe({
      next: (updated) => {
        this.updatingOrderId.set(null);
        this.orders.update((list) =>
          list.map((o) => (o.orderId === order.orderId ? updated : o))
        );
        this.pendingStatusMap.update((m) => ({
          ...m,
          [order.orderId]: updated.orderStatus
        }));
        this.successMessage.set(
          `Order #${order.orderId} updated to ${this.statusLabel(updated.orderStatus)}.`
        );
      },
      error: (err) => {
        this.updatingOrderId.set(null);
        this.errorMessage.set(
          err.error?.message || 'Failed to update order status.'
        );
      }
    });
  }

  toggleExpand(orderId: number): void {
    this.expandedOrderId.update((curr) => (curr === orderId ? null : orderId));
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
}
