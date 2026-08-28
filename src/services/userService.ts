import { UserProfile } from '../types';
import { apiClient } from './apiClient';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.patch<UserProfile>('/users/me', data);
  },

  async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    // S3 presigned URL integration step
    throw new Error('Connecting to AWS S3 storage backend...');
  }
};
