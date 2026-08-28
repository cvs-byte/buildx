import { apiClient } from './client';
import type { ResultRecord, ResultsFilter, AttendanceRecord, AttendanceSummary, ScheduledClass } from '../types/dashboard.types';
import type { ApiResponse } from '../types/api.types';

export const dashboardApi = {
  /**
   * Fetch Academic Results Dashboard data
   * Endpoint: GET /dashboards/results
   */
  async getResults(filters?: ResultsFilter): Promise<ResultRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<ResultRecord[]>>('/dashboards/results', {
        params: filters as Record<string, string>,
      });
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch Attendance Dashboard data & summary statistics
   * Endpoint: GET /dashboards/attendance
   */
  async getAttendance(): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary }> {
    try {
      const response = await apiClient.get<ApiResponse<{ records: AttendanceRecord[]; summary: AttendanceSummary }>>('/dashboards/attendance');
      return response.data || {
        records: [],
        summary: {
          totalUsers: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          onLeaveCount: 0,
          presentPercentage: 0,
        },
      };
    } catch {
      return {
        records: [],
        summary: {
          totalUsers: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          onLeaveCount: 0,
          presentPercentage: 0,
        },
      };
    }
  },

  /**
   * Fetch Today's Scheduled Classes Dashboard
   * Endpoint: GET /dashboards/today-classes
   */
  async getTodayClasses(): Promise<ScheduledClass[]> {
    try {
      const response = await apiClient.get<ApiResponse<ScheduledClass[]>>('/dashboards/today-classes');
      return response.data || [];
    } catch {
      return [];
    }
  },
};
