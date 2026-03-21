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
    isOrganizer?: boolean;
    organizer: { id: number; name: string };
    participants: { id: number; name: string }[];
    tags: { id: number; name: string }[];
}

export interface PaginatedResponse {
    data: Event[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const eventsApi = {
    getAll: async (search?: string, tagIds?: number[], page = 1, limit = 12): Promise<PaginatedResponse> => {
        const params: Record<string, string | number> = { page, limit };
        if (search) params.search = search;
        if (tagIds?.length) params.tags = tagIds.join(',');
        const { data } = await api.get('/events', { params });
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
    create: async (eventData: Omit<Event, 'id' | 'participantsCount' | 'isJoined' | 'isFull' | 'isOrganizer' | 'organizer' | 'participants' | 'tags'> & { tagIds?: number[] }) => {
        const { data } = await api.post('/events', eventData);
        return data;
    },
    update: async (id: number, eventData: Partial<Omit<Event, 'id' | 'participantsCount' | 'isJoined' | 'isFull' | 'isOrganizer' | 'organizer' | 'participants' | 'tags'> & { tagIds?: number[] }>) => {
        const { data } = await api.patch(`/events/${id}`, eventData);
        return data;
    },
    delete: async (id: number) => {
        const { data } = await api.delete(`/events/${id}`);
        return data;
    },
    getMyEvents: async (page = 1, limit = 12): Promise<PaginatedResponse> => {
        const { data } = await api.get('/users/me/events', { params: { page, limit } });
        return data;
    },
};
