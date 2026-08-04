import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const lifeAreaApi = {
  list: (params) => call(apiClient.get('/life-areas', { params })),
  getById: (id) => call(apiClient.get(`/life-areas/${id}`)),
  create: (payload) => call(apiClient.post('/life-areas', payload)),
  update: (id, payload) => call(apiClient.patch(`/life-areas/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/life-areas/${id}`)),
  reorder: (items) => call(apiClient.patch('/life-areas/reorder', { items })),
};
