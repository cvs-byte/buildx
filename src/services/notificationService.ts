import { NotificationItem } from '../types';
import { apiClient } from './apiClient';

export const notificationService = {
  async getMyNotifications(): Promise<NotificationItem[]> {
    try {
      return await apiClient.get<NotificationItem[]>('/notifications/my');
    } catch {
      // Empty state - NO fake notifications
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }
};
