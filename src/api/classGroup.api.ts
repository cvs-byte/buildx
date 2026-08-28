import { apiClient } from './client';
import type { ClassGroup, CreateClassGroupDTO } from '../types/classGroup.types';
import type { ApiResponse } from '../types/api.types';

export const classGroupApi = {
  /**
   * Fetch Class Groups (School Admin / Principal / Teacher)
   * Endpoint: GET /classes
   */
  async getClassGroups(tenantId?: string): Promise<ClassGroup[]> {
    try {
      const endpoint = tenantId ? `/classes?tenantId=${tenantId}` : '/classes';
      const response = await apiClient.get<ApiResponse<ClassGroup[]>>(endpoint);
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Create Class Group (School Admin / Principal)
   * Endpoint: POST /classes
   */
  async createClassGroup(dto: CreateClassGroupDTO): Promise<ClassGroup> {
    const response = await apiClient.post<ApiResponse<ClassGroup>>('/classes', dto);
    return response.data;
  },
};
