import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm;
  errorMessage = signal('');
  infoMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  private returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    this.returnUrl = queryParams.get('returnUrl') || '';

    if (queryParams.get('sessionExpired') === 'true') {
      this.infoMessage.set('Your session has expired. Please login again.');
    } else if (queryParams.get('registered') === 'true') {
      this.infoMessage.set('Account created successfully! Please login to continue.');
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isLoading.set(true);

    const loginData = {
      email: this.loginForm.value.email!.trim(),
      password: this.loginForm.value.password!
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const role = response.role.toLowerCase();

        if (role === 'admin') {
          this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
        } else if (role === 'customer') {
          this.router.navigateByUrl('/customer/dashboard', { replaceUrl: true });
        } else {
          this.authService.logout();
          this.errorMessage.set('Your account has an unsupported role.');
        }
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
          error.error?.message ||
          'Invalid email or password. Please try again.'
        );
      }
    });
  }
}
