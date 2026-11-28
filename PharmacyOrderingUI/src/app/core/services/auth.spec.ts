import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store session on login and clear on logout', () => {
    const futureExp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    service.login({ email: 'cust@example.com', password: 'Password1!' }).subscribe();

    const req = httpMock.expectOne('http://localhost:5271/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      userId: 'u-1',
      fullName: 'Jane Doe',
      email: 'cust@example.com',
      role: 'Customer',
      token: 'header.eyJleHAiOjQ3MDAwMDAwMDB9.sig',
      expiration: futureExp
    });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.isCustomer()).toBe(true);
    expect(service.isAdmin()).toBe(false);
    expect(service.getUser()?.fullName).toBe('Jane Doe');

    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should treat expired tokens as logged out', () => {
    sessionStorage.setItem('token', 'header.eyJleHAiOjEwMDB9.sig');
    sessionStorage.setItem('role', 'Customer');
    sessionStorage.setItem('token_expiration', '2020-01-01T00:00:00.000Z');
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u-1', fullName: 'Jane', email: 'a@b.com' }));

    expect(service.isTokenExpired()).toBe(true);
    expect(service.isLoggedIn()).toBe(false);
  });
});
