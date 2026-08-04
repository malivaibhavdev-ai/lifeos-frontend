import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const journalApi = {
  list: (params) => call(apiClient.get('/journal', { params })),
  getById: (id) => call(apiClient.get(`/journal/${id}`)),
  getByDate: (date) => call(apiClient.get(`/journal/by-date/${date}`)),
  create: (payload) => call(apiClient.post('/journal', payload)),
  update: (id, payload) => call(apiClient.patch(`/journal/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/journal/${id}`)),
  frequency: (params) => call(apiClient.get('/journal/frequency', { params })),
  writingStreak: () => call(apiClient.get('/journal/writing-streak')),
};
