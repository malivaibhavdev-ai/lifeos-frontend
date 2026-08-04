import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const moodApi = {
  list: (params) => call(apiClient.get('/mood', { params })),
  getLatestForDate: (date) => call(apiClient.get(`/mood/date/${date}`)),
  create: (payload) => call(apiClient.post('/mood', payload)),
  update: (id, payload) => call(apiClient.patch(`/mood/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/mood/${id}`)),
};
