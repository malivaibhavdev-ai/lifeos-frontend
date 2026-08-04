import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const projectApi = {
  list: (params) => call(apiClient.get('/projects', { params })),
  getById: (id) => call(apiClient.get(`/projects/${id}`)),
  create: (payload) => call(apiClient.post('/projects', payload)),
  update: (id, payload) => call(apiClient.patch(`/projects/${id}`, payload)),
  archive: (id, isArchived) => call(apiClient.patch(`/projects/${id}/archive`, { isArchived })),
  delete: (id) => call(apiClient.delete(`/projects/${id}`)),
  reorder: (items) => call(apiClient.patch('/projects/reorder', { items })),
  recalculateProgress: (id) => call(apiClient.post(`/projects/${id}/recalculate-progress`)),
};
