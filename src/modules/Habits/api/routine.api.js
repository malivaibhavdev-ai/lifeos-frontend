import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const routineApi = {
  list: (params) => call(apiClient.get('/routines', { params })),
  getById: (id) => call(apiClient.get(`/routines/${id}`)),
  create: (payload) => call(apiClient.post('/routines', payload)),
  update: (id, payload) => call(apiClient.patch(`/routines/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/routines/${id}`)),
  reorder: (items) => call(apiClient.patch('/routines/reorder', { items })),
  getProgress: (id, date) => call(apiClient.get(`/routines/${id}/progress`, { params: { date } })),
};
