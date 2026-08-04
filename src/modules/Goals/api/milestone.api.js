import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const milestoneApi = {
  list: (params) => call(apiClient.get('/milestones', { params })),
  getById: (id) => call(apiClient.get(`/milestones/${id}`)),
  create: (payload) => call(apiClient.post('/milestones', payload)),
  update: (id, payload) => call(apiClient.patch(`/milestones/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/milestones/${id}`)),
  reorder: (items) => call(apiClient.patch('/milestones/reorder', { items })),
  getDependencyStatus: (id) => call(apiClient.get(`/milestones/${id}/dependencies`)),
};
