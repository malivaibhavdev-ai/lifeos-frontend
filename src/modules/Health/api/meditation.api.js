import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const meditationApi = {
  list: (params) => call(apiClient.get('/meditation', { params })),
  streak: () => call(apiClient.get('/meditation/streak')),
  create: (payload) => call(apiClient.post('/meditation', payload)),
  update: (id, payload) => call(apiClient.patch(`/meditation/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/meditation/${id}`)),
};
