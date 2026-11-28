import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MedicineService } from '../../../../core/services/medicine.service';
import { Medicine } from '../../../../models/medicine.model';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.css'
})
export class MedicineList implements OnInit {
  medicines = signal<Medicine[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('All');
  stockFilter = signal<'All' | 'InStock' | 'LowStock' | 'OutOfStock'>('All');
  confirmDeactivateId = signal<number | null>(null);
  deactivatingId = signal<number | null>(null);

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
    const stock = this.stockFilter();

    return this.medicines().filter((m) => {
      const catMatch =
        cat === 'All' || m.category.toLowerCase() === cat.toLowerCase();
      const termMatch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term);

      let stockMatch = true;
      if (stock === 'InStock') {
        stockMatch = m.stockQuantity > 10;
      } else if (stock === 'LowStock') {
        stockMatch = m.stockQuantity > 0 && m.stockQuantity <= 10;
      } else if (stock === 'OutOfStock') {
        stockMatch = m.stockQuantity === 0;
      }

      return catMatch && termMatch && stockMatch;
    });
  });

  constructor(private medicineService: MedicineService) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.medicineService.getAllMedicines().subscribe({
      next: (data) => {
        this.medicines.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load medicines.');
        this.isLoading.set(false);
      }
    });
  }

  requestDeactivate(medicineId: number): void {
    this.confirmDeactivateId.set(medicineId);
  }

  cancelDeactivate(): void {
    this.confirmDeactivateId.set(null);
  }

  confirmDeactivate(medicine: Medicine): void {
    this.deactivatingId.set(medicine.medicineId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.medicineService.deleteMedicine(medicine.medicineId).subscribe({
      next: () => {
        this.deactivatingId.set(null);
        this.confirmDeactivateId.set(null);
        this.medicines.update((list) =>
          list.filter((m) => m.medicineId !== medicine.medicineId)
        );
        this.successMessage.set(`${medicine.name} has been deactivated.`);
      },
      error: (err) => {
        this.deactivatingId.set(null);
        this.confirmDeactivateId.set(null);
        this.errorMessage.set(
          err.error?.message || 'Unable to deactivate medicine.'
        );
      }
    });
  }
}
