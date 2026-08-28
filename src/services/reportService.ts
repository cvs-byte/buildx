import { ReportModel } from '../types';
import { apiClient } from './apiClient';

export const reportService = {
  async getReports(category?: string): Promise<ReportModel[]> {
    try {
      return await apiClient.get<ReportModel[]>(`/reports${category ? `?category=${category}` : ''}`);
    } catch {
      return [];
    }
  },

  async generateReport(type: string, filters: any, format: 'PDF' | 'CSV'): Promise<{ downloadUrl: string }> {
    return apiClient.post<{ downloadUrl: string }>('/reports/generate', { type, filters, format });
  }
};
