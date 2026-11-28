import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { MedicineService } from '../../../core/services/medicine.service';
import { Medicine } from '../../../models/medicine.model';

@Component({
  selector: 'app-customer-medicines',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-medicines.html',
  styleUrl: './customer-medicines.css'
})
export class CustomerMedicinesComponent implements OnInit {
  medicines = signal<Medicine[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('All');
  quantities = signal<Record<number, number>>({});
  addingId = signal<number | null>(null);
  feedbackMessage = signal<string>('');
  feedbackError = signal<string>('');

  categories = computed(() => {
    const set = new Set<string>(['All']);
    for (const m of this.medicines()) {
      if (m.category) {
        set.add(m.category);
      }
    }
    return Array.from(set);
  });

  filteredMedicines = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const cat = this.selectedCategory();

    return this.medicines().filter((m) => {
      const catMatch =
        cat === 'All' || m.category.toLowerCase() === cat.toLowerCase();
      const termMatch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term);
      return catMatch && termMatch;
    });
  });

  constructor(
    private medicineService: MedicineService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading.set(true);
    this.medicineService.getAllMedicines().subscribe({
      next: (data) => {
        const active = data.filter((m) => m.isActive);
        this.medicines.set(active);
        const qtyMap: Record<number, number> = {};
        for (const m of active) {
          qtyMap[m.medicineId] = 1;
        }
        this.quantities.set(qtyMap);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load medicines.');
        this.isLoading.set(false);
      }
    });
  }

  getQty(medicineId: number): number {
    return this.quantities()[medicineId] ?? 1;
  }

  setQty(medicine: Medicine, delta: number): void {
    const current = this.getQty(medicine.medicineId);
    const maxAllowed = Math.min(100, medicine.stockQuantity);
    const next = Math.max(1, Math.min(maxAllowed, current + delta));
    this.quantities.update((map) => ({ ...map, [medicine.medicineId]: next }));
  }

  addToCart(medicine: Medicine): void {
    if (medicine.stockQuantity <= 0) {
      return;
    }

    const qty = this.getQty(medicine.medicineId);
    this.addingId.set(medicine.medicineId);
    this.feedbackMessage.set('');
    this.feedbackError.set('');

    this.cartService.addToCart(medicine.medicineId, qty).subscribe({
      next: () => {
        this.addingId.set(null);
        this.feedbackMessage.set(
          `Added ${qty} × ${medicine.name} to your cart.`
        );
      },
      error: (err) => {
        this.addingId.set(null);
        this.feedbackError.set(
          err.error?.message || 'Unable to add medicine to cart.'
        );
      }
    });
  }
}
