import { Parent } from '../types';
import { apiClient } from './apiClient';

export const parentService = {
  async getParents(): Promise<Parent[]> {
    try {
      return await apiClient.get<Parent[]>('/parents');
    } catch {
      return [];
    }
  },

  async getMyChildren(): Promise<{ id: string; name: string; className: string }[]> {
    try {
      return await apiClient.get<{ id: string; name: string; className: string }[]>('/parents/my-children');
    } catch {
      return [];
    }
  }
};
