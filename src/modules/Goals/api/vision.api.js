import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const visionApi = {
  list: (params) => call(apiClient.get('/visions', { params })),
  getById: (id) => call(apiClient.get(`/visions/${id}`)),
  create: (payload) => call(apiClient.post('/visions', payload)),
  update: (id, payload) => call(apiClient.patch(`/visions/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/visions/${id}`)),
  reorder: (items) => call(apiClient.patch('/visions/reorder', { items })),
};
