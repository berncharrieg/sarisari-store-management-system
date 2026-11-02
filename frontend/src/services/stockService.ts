import api from './api';
import type { ProductStock } from '../types';

export const stockService = {
  // Get all stock logs
  getAll: async (productId?: number): Promise<ProductStock[]> => {
    const params = productId ? { productId: productId } : {};
    const response = await api.get<ProductStock[]>('/product-stocks', { params });
    return response.data;
  },

  // Add or deduct stock
  create: async (data: {
    productId: number;
    quantity: number;
    type: 'add' | 'deduct';
    note?: string;
  }): Promise<{ stock_log: ProductStock; new_stock: number }> => {
    const response = await api.post('/product-stocks', data);
    return response.data;
  },

  // Get stock history for a product
  getHistory: async (productId: number): Promise<{ product: any; history: ProductStock[] }> => {
    const response = await api.get(`/products/${productId}/stock-history`);
    return response.data;
  },
};