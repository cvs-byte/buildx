import { EventModel } from '../types';
import { apiClient } from './apiClient';

export const eventService = {
  async getEvents(audience?: string): Promise<EventModel[]> {
    try {
      return await apiClient.get<EventModel[]>(`/events${audience ? `?audience=${audience}` : ''}`);
    } catch {
      return [];
    }
  },

  async createEvent(event: Partial<EventModel>): Promise<EventModel> {
    return apiClient.post<EventModel>('/events', event);
  }
};
