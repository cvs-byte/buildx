import { apiClient } from './client';
import type { LeaveRequest, CreateLeaveDTO } from '../types/leave.types';
import type { ApiResponse } from '../types/api.types';

export const leaveApi = {
  /**
   * Fetch Leave Requests (Admin & School Admin)
   * Endpoint: GET /leaves
   */
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    try {
      const response = await apiClient.get<ApiResponse<LeaveRequest[]>>('/leaves');
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Approve Leave Request
   * Endpoint: PUT /leaves/:id/approve
   */
  async approveLeave(id: string, remarks?: string): Promise<LeaveRequest> {
    const response = await apiClient.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`, { remarks });
    return response.data;
  },

  /**
   * Reject Leave Request
   * Endpoint: PUT /leaves/:id/reject
   */
  async rejectLeave(id: string, remarks?: string): Promise<LeaveRequest> {
    const response = await apiClient.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { remarks });
    return response.data;
  },

  /**
   * Submit new Leave Request
   * Endpoint: POST /leaves
   */
  async submitLeave(dto: CreateLeaveDTO): Promise<LeaveRequest> {
    const response = await apiClient.post<ApiResponse<LeaveRequest>>('/leaves', dto);
    return response.data;
  },
};
