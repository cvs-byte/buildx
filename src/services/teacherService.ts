import { Teacher } from '../types';
import { apiClient } from './apiClient';

export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    try {
      return await apiClient.get<Teacher[]>('/teachers');
    } catch {
      return [];
    }
  },

  async createTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
    return apiClient.post<Teacher>('/teachers', teacher);
  }
};
