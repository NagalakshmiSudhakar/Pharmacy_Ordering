import { Injectable } from '@angular/core';
import { PaymentMethod, PaymentRecord } from '../../models/order.model';

const STORAGE_KEY = 'pharmacare_payment_records';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  generateTransactionId(method: PaymentMethod): string {
    const prefixMap: Record<PaymentMethod, string> = {
      Card: 'CRD',
      UPI: 'UPI',
      NetBanking: 'NBK',
      COD: 'COD'
    };
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timePart = Date.now().toString().slice(-6);
    return `TXN-${prefixMap[method]}-${timePart}-${randomPart}`;
  }

  savePaymentRecord(record: PaymentRecord): void {
    const all = this.readAll();
    all[String(record.orderId)] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  getPaymentForOrder(orderId: number): PaymentRecord | null {
    const all = this.readAll();
    return all[String(orderId)] ?? null;
  }

  private readAll(): Record<string, PaymentRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, PaymentRecord>) : {};
    } catch {
      return {};
    }
  }
}
