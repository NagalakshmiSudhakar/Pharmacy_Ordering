import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AddToCartRequest,
  CartResponse,
  UpdateCartItemRequest
} from '../../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5271/api/cart';

  private _cart = signal<CartResponse | null>(null);
  private _isLoading = signal<boolean>(false);

  readonly cart = this._cart.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly cartItems = computed(() => this._cart()?.items ?? []);
  readonly cartCount = computed(() =>
    (this._cart()?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly cartTotal = computed(() => this._cart()?.totalAmount ?? 0);

  constructor(private http: HttpClient) {}

  loadCart(): Observable<CartResponse> {
    this._isLoading.set(true);
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap({
        next: (cart) => {
          this._cart.set(cart);
          this._isLoading.set(false);
        },
        error: () => {
          this._isLoading.set(false);
        }
      })
    );
  }

  addToCart(medicineId: number, quantity = 1): Observable<CartResponse> {
    const payload: AddToCartRequest = { medicineId, quantity };
    return this.http.post<CartResponse>(`${this.apiUrl}/items`, payload).pipe(
      tap((cart) => this._cart.set(cart))
    );
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<CartResponse> {
    const payload: UpdateCartItemRequest = { quantity };
    return this.http
      .put<CartResponse>(`${this.apiUrl}/items/${cartItemId}`, payload)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  removeCartItem(cartItemId: number): Observable<CartResponse> {
    return this.http
      .delete<CartResponse>(`${this.apiUrl}/items/${cartItemId}`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  clearCart(): Observable<CartResponse> {
    return this.http
      .delete<CartResponse>(`${this.apiUrl}/clear`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  resetLocalCart(): void {
    this._cart.set(null);
  }
}
