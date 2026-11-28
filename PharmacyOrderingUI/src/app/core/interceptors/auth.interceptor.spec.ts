import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should attach Bearer token to API requests', () => {
    sessionStorage.setItem('token', 'header.eyJleHAiOjQ3MDAwMDAwMDB9.sig');
    sessionStorage.setItem('token_expiration', '2099-01-01T00:00:00.000Z');

    http.get('http://localhost:5271/api/cart').subscribe();

    const req = httpMock.expectOne('http://localhost:5271/api/cart');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer header.eyJleHAiOjQ3MDAwMDAwMDB9.sig'
    );
    req.flush({ cartId: 1, userId: 'u-1', items: [], totalAmount: 0 });
  });

  it('should not attach token to auth endpoints', () => {
    sessionStorage.setItem('token', 'header.eyJleHAiOjQ3MDAwMDAwMDB9.sig');
    sessionStorage.setItem('token_expiration', '2099-01-01T00:00:00.000Z');

    http.post('http://localhost:5271/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:5271/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should logout and redirect on 401 from protected endpoint', () => {
    sessionStorage.setItem('token', 'header.eyJleHAiOjQ3MDAwMDAwMDB9.sig');
    sessionStorage.setItem('token_expiration', '2099-01-01T00:00:00.000Z');
    sessionStorage.setItem('role', 'Customer');
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('http://localhost:5271/api/orders/my-orders').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('http://localhost:5271/api/orders/my-orders');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.getToken()).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/login'], expect.any(Object));
  });
});
