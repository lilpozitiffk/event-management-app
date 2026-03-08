import api from './api';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number | null;
  isPublic: boolean;
  participantsCount: number;
  isJoined: boolean;
  isFull: boolean;
  organizer: { id: number; name: string };
}

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const { data } = await api.get('/events');
    return data;
  },

  getById: async (id: number): Promise<Event> => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },

  join: async (id: number) => {
    const { data } = await api.post(`/events/${id}/join`);
    return data;
  },

  leave: async (id: number) => {
    const { data } = await api.post(`/events/${id}/leave`);
    return data;
  },

  create: async (eventData: any) => {
    const { data } = await api.post('/events', eventData);
    return data;
  },
};
