import api from './api';

export interface Tag {
  id: number;
  name: string;
}

export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    const { data } = await api.get('/tags');
    return data;
  },
};
