import { Student } from '../types';
import { apiClient } from './apiClient';

export const studentService = {
  async getStudents(filters?: { search?: string; className?: string }): Promise<Student[]> {
    try {
      let query = '';
      if (filters?.search) query += `search=${filters.search}&`;
      if (filters?.className) query += `className=${filters.className}&`;
      return await apiClient.get<Student[]>(`/students${query ? `?${query}` : ''}`);
    } catch {
      // Empty state when API is not connected - ZERO fake records
      return [];
    }
  },

  async getStudent(id: string): Promise<Student | null> {
    try {
      return await apiClient.get<Student>(`/students/${id}`);
    } catch {
      return null;
    }
  },

  async createStudent(student: Partial<Student>): Promise<Student> {
    return apiClient.post<Student>('/students', student);
  },

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    return apiClient.put<Student>(`/students/${id}`, student);
  }
};
