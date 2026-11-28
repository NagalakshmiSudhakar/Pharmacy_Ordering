import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MedicineService } from '../../../core/services/medicine.service';
import { OrderService } from '../../../core/services/order.service';
import { Medicine } from '../../../models/medicine.model';
import {
  OrderResponse,
  OrderStatus,
  getOrderStatusClass,
  getOrderStatusLabel
} from '../../../models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  medicines = signal<Medicine[]>([]);
  orders = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  totalMedicines = computed(() => this.medicines().length);
  availableMedicines = computed(() =>
    this.medicines().filter((m) => m.isActive && m.stockQuantity > 0).length
  );
  lowStockMedicines = computed(() =>
    this.medicines().filter(
      (m) => m.isActive && m.stockQuantity > 0 && m.stockQuantity <= 10
    ).length
  );
  outOfStock = computed(() =>
    this.medicines().filter((m) => m.isActive && m.stockQuantity === 0).length
  );

  totalOrders = computed(() => this.orders().length);
  pendingOrders = computed(() =>
    this.orders().filter(
      (o) =>
        o.orderStatus === OrderStatus.Pending ||
        o.orderStatus === OrderStatus.Confirmed
    ).length
  );
  deliveredOrders = computed(() =>
    this.orders().filter((o) => o.orderStatus === OrderStatus.Delivered).length
  );
  totalRevenue = computed(() =>
    this.orders()
      .filter((o) => o.orderStatus !== OrderStatus.Cancelled)
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );
  recentOrders = computed(() => this.orders().slice(0, 6));

  constructor(
    private medicineService: MedicineService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.medicineService.getAllMedicines().subscribe({
      next: (data) => {
        this.medicines.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load medicine statistics.');
        this.isLoading.set(false);
      }
    });

    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: () => {
        // Keep medicine stats visible even if orders fail to load
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
