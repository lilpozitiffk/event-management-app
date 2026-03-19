import api from './api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aiApi = {
  ask: async (question: string, history: ChatMessage[] = []): Promise<{ answer: string }> => {
    const { data } = await api.post('/ai/ask', { question, history });
    return data;
  },
};
