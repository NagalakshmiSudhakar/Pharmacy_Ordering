import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';

import { adminGuard, customerGuard, guestGuard } from './auth.guard';

describe('auth guards', () => {
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = { url: '/customer/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])]
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should redirect unauthenticated users to /login in customerGuard', () => {
    const result = TestBed.runInInjectionContext(() =>
      customerGuard(dummyRoute, dummyState)
    );
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toContain('/login');
  });

  it('should allow admin in adminGuard and block customer', () => {
    sessionStorage.setItem('token', 'header.eyJleHAiOjQ3MDAwMDAwMDB9.sig');
    sessionStorage.setItem('token_expiration', '2099-01-01T00:00:00.000Z');
    sessionStorage.setItem('role', 'Admin');
    sessionStorage.setItem('user', JSON.stringify({ userId: 'a-1', fullName: 'Admin', email: 'admin@test.com' }));

    const adminResult = TestBed.runInInjectionContext(() =>
      adminGuard(dummyRoute, dummyState)
    );
    expect(adminResult).toBe(true);

    const custResult = TestBed.runInInjectionContext(() =>
      customerGuard(dummyRoute, dummyState)
    );
    expect((custResult as UrlTree).toString()).toBe('/admin/dashboard');
  });

  it('should redirect logged-in customer away from guest routes', () => {
    sessionStorage.setItem('token', 'header.eyJleHAiOjQ3MDAwMDAwMDB9.sig');
    sessionStorage.setItem('token_expiration', '2099-01-01T00:00:00.000Z');
    sessionStorage.setItem('role', 'Customer');
    sessionStorage.setItem('user', JSON.stringify({ userId: 'c-1', fullName: 'Cust', email: 'cust@test.com' }));

    const result = TestBed.runInInjectionContext(() =>
      guestGuard(dummyRoute, dummyState)
    );
    expect((result as UrlTree).toString()).toBe('/customer/dashboard');
  });
});
