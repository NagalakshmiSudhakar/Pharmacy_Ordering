import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  MedicineRequest,
  MedicineService
} from '../../../../core/services/medicine.service';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './medicine-form.html',
  styleUrl: './medicine-form.css'
})
export class MedicineForm implements OnInit {
  medicineForm;
  isEditMode = signal<boolean>(false);
  medicineId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  readonly categoryOptions = [
    'Medicines',
    'First Aid',
    'Personal Care',
    'Wellness',
    'Pain Relief',
    'Antibiotics',
    'Vitamins',
    'Diabetes Care'
  ];

  constructor(
    private fb: FormBuilder,
    private medicineService: MedicineService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.medicineForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['Medicines', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(100000)]],
      stockQuantity: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isNaN(id) && id > 0) {
        this.isEditMode.set(true);
        this.medicineId.set(id);
        this.loadMedicine(id);
      }
    }
  }

  loadMedicine(id: number): void {
    this.isLoading.set(true);
    this.medicineService.getMedicineById(id).subscribe({
      next: (medicine) => {
        this.medicineForm.patchValue({
          name: medicine.name,
          category: medicine.category,
          description: medicine.description,
          price: medicine.price,
          stockQuantity: medicine.stockQuantity,
          imageUrl: medicine.imageUrl || ''
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Medicine not found or unavailable.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.medicineForm.invalid) {
      this.medicineForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSaving.set(true);

    const val = this.medicineForm.getRawValue();
    const payload: MedicineRequest = {
      name: val.name!.trim(),
      category: val.category!.trim(),
      description: val.description!.trim(),
      price: Number(val.price),
      stockQuantity: Number(val.stockQuantity),
      imageUrl: val.imageUrl?.trim() ? val.imageUrl.trim() : null
    };

    const id = this.medicineId();
    const request$ =
      this.isEditMode() && id !== null
        ? this.medicineService.updateMedicine(id, payload)
        : this.medicineService.addMedicine(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(
          this.isEditMode()
            ? 'Medicine updated successfully!'
            : 'Medicine added successfully!'
        );
        setTimeout(() => {
          this.router.navigate(['/admin/medicines']);
        }, 900);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.message ||
            'Unable to save medicine. Please check your inputs and permissions.'
        );
      }
    });
  }
}
