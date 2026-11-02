import api from './api';
import type { Transaction, TransactionCounts } from '../types';

export const transactionService = {
  // Get all transactions
  // getAll: async (): Promise<Transaction[]> => {
  //   const response = await api.get<Transaction[]>('/transactions');
  //   return response.data;
  // },

  
 getAll: async (filters?: {
    paymentStatus: 'paid' | 'unpaid';
    buyerName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: Transaction[]; counts: TransactionCounts }> => {
    const params = new URLSearchParams();
    if (filters?.paymentStatus) params.append('payment_status', filters.paymentStatus);
    if (filters?.buyerName) params.append('buyer_name', filters.buyerName);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const response = await api.get(`/transactions?${params.toString()}`);
    return {
      transactions: response.data.transactions,
      counts: response.data.counts
    };
  },
  // Get single transaction
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  // Create transaction
  create: async (data: {
    buyerName: string;
    items: { productId: number; quantity: number }[];
    paymentStatus?: 'paid' | 'unpaid';
    paymentMethod?: string;
  }): Promise<Transaction> => {
    // DEBUG: Log what we're sending
    console.log('Transaction Service - Sending data:', JSON.stringify(data, null, 2));
    
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

    // Update payment status
  updatePayment: async (id: number, data: {
    paymentStatus: 'paid' | 'unpaid';
    paymentMethod?: string;
  }): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}/payment`, data);
    return response.data;
  },

};
