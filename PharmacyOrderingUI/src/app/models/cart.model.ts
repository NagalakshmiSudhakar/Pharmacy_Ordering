export interface CartItem {
  cartItemId: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface CartResponse {
  cartId: number;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

export interface AddToCartRequest {
  medicineId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
