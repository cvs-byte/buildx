import { UserProfile, AuditLogRecord } from '../types';
import { apiClient } from './apiClient';

export interface AdminAnalyticsSummary {
  totalStudents: number;
  totalTeachers: number;
  todayAttendanceRate: number;
  pendingFeeTotal: number;
}

export const adminService = {
  async getUsers(page = 1, limit = 20): Promise<{ users: UserProfile[]; total: number }> {
    try {
      return await apiClient.get<{ users: UserProfile[]; total: number }>(`/admin/users?page=${page}&limit=${limit}`);
    } catch {
      return { users: [], total: 0 };
    }
  },

  async getAnalytics(): Promise<AdminAnalyticsSummary | null> {
    try {
      return await apiClient.get<AdminAnalyticsSummary>('/admin/analytics');
    } catch {
      return null;
    }
  },

  async getAuditLogs(): Promise<AuditLogRecord[]> {
    try {
      return await apiClient.get<AuditLogRecord[]>('/admin/audit-logs');
    } catch {
      return [];
    }
  },

  async sendSystemNotification(data: { title: string; message: string; targetRole?: string }): Promise<void> {
    await apiClient.post('/admin/notifications/broadcast', data);
  }
};
