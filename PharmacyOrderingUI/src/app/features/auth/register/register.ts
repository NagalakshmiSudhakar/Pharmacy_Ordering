import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm;
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
        ]
      ],
      confirmPassword: ['', Validators.required]
    });
  }

  get passwordsDoNotMatch(): boolean {
    const pass = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    const touched = this.registerForm.get('confirmPassword')?.touched;
    return !!touched && !!confirm && pass !== confirm;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      this.errorMessage.set('Passwords do not match!');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const registerData = {
      fullName: formValue.fullName!.trim(),
      email: formValue.email!.trim(),
      phoneNumber: formValue.phone!.trim(),
      password: formValue.password!,
      confirmPassword: formValue.confirmPassword!
    };

    this.authService.register(registerData).subscribe({
      next: (response: unknown) => {
        this.isLoading.set(false);
        const res = response as { message?: string };
        this.successMessage.set(res?.message || 'Registration successful!');
        this.registerForm.reset();

        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' }
          });
        }, 1200);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 0) {
          this.errorMessage.set(
            'Cannot connect to the API server. Make sure PharmacyOrderingAPI is running on http://localhost:5271.'
          );
          return;
        }
        this.errorMessage.set(
          error.error?.errors?.join(', ') ||
          error.error?.message ||
          'Registration failed. Please try again.'
        );
      }
    });
  }
}
