import api from './api';
import type { DailySalesReport, QuickSalesReport } from '../types';

export const salesReportService = {
  // Get daily sales report for specific date
  getDailyReport: async (date?: string): Promise<DailySalesReport> => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/sales-report${params}`);
    return response.data;
  },

  // Get quick report (today, yesterday, etc.)
  getQuickReport: async (period: 'today' | 'yesterday' | 'this_week' | 'this_month'): Promise<QuickSalesReport> => {
    const response = await api.get(`/sales-report/quick?period=${period}`);
    return response.data;
  },
};