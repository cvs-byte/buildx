import { NoticeModel } from '../types';
import { apiClient } from './apiClient';

export const noticeService = {
  async getNotices(audience?: string): Promise<NoticeModel[]> {
    try {
      return await apiClient.get<NoticeModel[]>(`/notices${audience ? `?audience=${audience}` : ''}`);
    } catch {
      return [];
    }
  },

  async createNotice(notice: Partial<NoticeModel>): Promise<NoticeModel> {
    return apiClient.post<NoticeModel>('/notices', notice);
  }
};
