import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart.service';
import { MedicineService } from '../../core/services/medicine.service';
import { Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  medicines = signal<Medicine[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('All');
  toastMessage = signal<string>('');
  toastError = signal<string>('');
  addingMedicineId = signal<number | null>(null);

  categories = computed(() => {
    const base = new Set<string>(['All']);
    for (const m of this.medicines()) {
      if (m.category) {
        base.add(m.category);
      }
    }
    return Array.from(base);
  });

  filteredMedicines = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.medicines().filter((m) => {
      const matchesCategory =
        category === 'All' ||
        m.category.toLowerCase() === category.toLowerCase();
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private medicineService: MedicineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMedicines();

    if (this.authService.isCustomer()) {
      this.cartService.loadCart().subscribe({ error: () => {} });
    }
  }

  loadMedicines(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.medicineService.getAllMedicines().subscribe({
      next: (medicines) => {
        this.medicines.set(medicines.filter((medicine) => medicine.isActive));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to load medicines. Please try again later.'
        );
        this.isLoading.set(false);
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  addToCart(medicine: Medicine): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    if (this.authService.isAdmin()) {
      this.showToast('Admins cannot place customer orders.', true);
      return;
    }

    if (medicine.stockQuantity <= 0) {
      this.showToast(`${medicine.name} is currently out of stock.`, true);
      return;
    }

    this.addingMedicineId.set(medicine.medicineId);
    this.cartService.addToCart(medicine.medicineId, 1).subscribe({
      next: () => {
        this.addingMedicineId.set(null);
        this.showToast(`${medicine.name} added to your cart.`);
      },
      error: (err) => {
        this.addingMedicineId.set(null);
        this.showToast(
          err.error?.message || 'Could not add medicine to cart.',
          true
        );
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetLocalCart();
    this.router.navigate(['/']);
  }

  private showToast(message: string, isError = false): void {
    if (isError) {
      this.toastError.set(message);
      this.toastMessage.set('');
    } else {
      this.toastMessage.set(message);
      this.toastError.set('');
    }

    setTimeout(() => {
      this.toastMessage.set('');
      this.toastError.set('');
    }, 3000);
  }
}
