import { PaymentRecord, FeeStructure } from '../types';
import { apiClient } from './apiClient';

export interface FeeSummary {
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  overdueFee: number;
  dueDate: string;
}

export const feeService = {
  async getStudentFees(studentId?: string): Promise<{ payments: PaymentRecord[]; summary: FeeSummary | null }> {
    try {
      return await apiClient.get(`/fees/student${studentId ? `?studentId=${studentId}` : ''}`);
    } catch {
      return { payments: [], summary: null };
    }
  },

  async getFeeStructures(): Promise<FeeStructure[]> {
    try {
      return await apiClient.get<FeeStructure[]>('/fees/structures');
    } catch {
      return [];
    }
  },

  async processPayment(paymentId: string, amount: number, method: string): Promise<{ success: boolean; transactionRef: string }> {
    return apiClient.post<{ success: boolean; transactionRef: string }>('/fees/pay', { paymentId, amount, method });
  }
};
