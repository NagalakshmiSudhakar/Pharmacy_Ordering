export enum OrderStatus {
  Pending = 1,
  Confirmed = 2,
  Processing = 3,
  Shipped = 4,
  Delivered = 5,
  Cancelled = 6
}

export interface OrderItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface OrderResponse {
  orderId: number;
  userId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderItems: OrderItem[];
}

export interface UpdateOrderStatusRequest {
  orderStatus: OrderStatus;
}

export type PaymentMethod = 'Card' | 'UPI' | 'NetBanking' | 'COD';

export interface PaymentRecord {
  orderId: number;
  transactionId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending on Delivery';
  amount: number;
  paidAt: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  paymentSummary: string;
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; cssClass: string; step: number }
> = {
  [OrderStatus.Pending]: { label: 'Pending', cssClass: 'status-pending', step: 1 },
  [OrderStatus.Confirmed]: { label: 'Confirmed', cssClass: 'status-confirmed', step: 2 },
  [OrderStatus.Processing]: { label: 'Processing', cssClass: 'status-processing', step: 3 },
  [OrderStatus.Shipped]: { label: 'Shipped', cssClass: 'status-shipped', step: 4 },
  [OrderStatus.Delivered]: { label: 'Delivered', cssClass: 'status-delivered', step: 5 },
  [OrderStatus.Cancelled]: { label: 'Cancelled', cssClass: 'status-cancelled', step: 0 }
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_META[status]?.label ?? 'Unknown';
}

export function getOrderStatusClass(status: OrderStatus): string {
  return ORDER_STATUS_META[status]?.cssClass ?? 'status-pending';
}

export function getOrderStep(status: OrderStatus): number {
  return ORDER_STATUS_META[status]?.step ?? 0;
}
