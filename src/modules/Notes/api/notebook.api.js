import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const notebookApi = {
  list: (params) => call(apiClient.get('/notebooks', { params })),
  getById: (id) => call(apiClient.get(`/notebooks/${id}`)),
  create: (payload) => call(apiClient.post('/notebooks', payload)),
  update: (id, payload) => call(apiClient.patch(`/notebooks/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/notebooks/${id}`)),
  reorder: (items) => call(apiClient.patch('/notebooks/reorder', { items })),
};
