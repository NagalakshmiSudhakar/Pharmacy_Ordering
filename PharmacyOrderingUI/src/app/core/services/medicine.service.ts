
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine } from '../../models/medicine.model';

export interface MedicineRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  private apiUrl = 'http://localhost:5271/api/medicines';

  constructor(private http: HttpClient) {}

  // Get all medicines
  getAllMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  // Get medicine by ID
  getMedicineById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  // Add medicine
  addMedicine(data: MedicineRequest): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, data);
  }

  // Update medicine
  updateMedicine(
    id: number,
    data: MedicineRequest
  ): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, data);
  }

  // Deactivate medicine
  deleteMedicine(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }
}
