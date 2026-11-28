
export interface Medicine {
  medicineId: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}
