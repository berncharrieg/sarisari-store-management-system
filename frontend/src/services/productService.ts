import api from './api';
import type { Product, ApiResponse } from '../types';

export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  // Get single product
  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (data: { name: string; price: number; stock: number }): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  // Update product
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};