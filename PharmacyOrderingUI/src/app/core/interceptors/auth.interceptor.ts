import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

const API_BASE_URL = 'http://localhost:5271/api';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isAuthEndpoint = req.url.includes('/api/auth/');

  let outgoingReq = req;

  if (isApiRequest && !isAuthEndpoint) {
    const token = authService.getToken();
    // Always attach token if it exists — let the server decide validity
    if (token) {
      outgoingReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(outgoingReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only force logout + redirect on 401 when user is currently on a protected route
      // (not when they just logged in and the token is freshly issued)
      if (isApiRequest && !isAuthEndpoint && error.status === 401) {
        const currentUrl = router.url;
        const isOnLoginPage = currentUrl.startsWith('/login');
        const isOnRegisterPage = currentUrl.startsWith('/register');

        // Don't redirect if we're already on auth pages or if user has no token
        // (login failure is handled by the login component itself)
        if (!isOnLoginPage && !isOnRegisterPage && authService.getToken()) {
          authService.logout();
          router.navigate(['/login'], {
            queryParams: {
              sessionExpired: 'true'
            }
          });
        }
      }
      return throwError(() => error);
    })
  );
};
