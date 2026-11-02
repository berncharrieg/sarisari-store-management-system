import api from './api';
import type { TopBuyer, BuyerDetails } from '../types';

interface BuyerSearchResult {
  buyerName: string;
  transactionCount: number;
  totalSpent: number;
}

export const buyerService = {
  // Search buyers by name
  search: async (name: string): Promise<BuyerSearchResult[]> => {
    const response = await api.get(`/buyers/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  // Get top buyers
  getTopBuyers: async (limit: number = 10): Promise<TopBuyer[]> => {
    const response = await api.get(`/buyers/top?limit=${limit}`);
    return response.data;
  },

  // Get buyer details
  getBuyerDetails: async (buyerName: string): Promise<BuyerDetails> => {
    const response = await api.get(`/buyers/${encodeURIComponent(buyerName)}`);
    return response.data;
  },
};