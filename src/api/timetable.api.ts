import { apiClient } from './client';
import type { TimetableEntry, CreateTimetableDTO } from '../types/timetable.types';
import type { ApiResponse } from '../types/api.types';

export const timetableApi = {
  /**
   * Fetch all Timetable entries (School Admin / Principal / Teacher)
   * Endpoint: GET /timetables
   */
  async getTimetables(teacherId?: string): Promise<TimetableEntry[]> {
    try {
      const endpoint = teacherId ? `/timetables?teacherId=${teacherId}` : '/timetables';
      const response = await apiClient.get<ApiResponse<TimetableEntry[]>>(endpoint);
      return response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Schedule new Timetable entry (School Admin / Principal)
   * Endpoint: POST /timetables
   */
  async createTimetableEntry(dto: CreateTimetableDTO): Promise<TimetableEntry> {
    const response = await apiClient.post<ApiResponse<TimetableEntry>>('/timetables', dto);
    return response.data;
  },

  /**
   * Delete Timetable entry
   * Endpoint: DELETE /timetables/:id
   */
  async deleteTimetableEntry(id: string): Promise<void> {
    await apiClient.delete(`/timetables/${id}`);
  },
};
