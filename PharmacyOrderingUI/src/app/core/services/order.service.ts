import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrderResponse,
  OrderStatus,
  UpdateOrderStatusRequest
} from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5271/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, {});
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/my-orders`);
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/admin/all`);
  }

  updateOrderStatus(
    id: number,
    orderStatus: OrderStatus
  ): Observable<OrderResponse> {
    const payload: UpdateOrderStatusRequest = { orderStatus };
    return this.http.put<OrderResponse>(`${this.apiUrl}/${id}/status`, payload);
  }
}
