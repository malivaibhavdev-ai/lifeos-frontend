import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const goalApi = {
  list: (params) => call(apiClient.get('/goals', { params })),
  getById: (id) => call(apiClient.get(`/goals/${id}`)),
  create: (payload) => call(apiClient.post('/goals', payload)),
  update: (id, payload) => call(apiClient.patch(`/goals/${id}`, payload)),
  archive: (id, isArchived) => call(apiClient.patch(`/goals/${id}/archive`, { isArchived })),
  delete: (id) => call(apiClient.delete(`/goals/${id}`)),
  reorder: (items) => call(apiClient.patch('/goals/reorder', { items })),
  recalculateProgress: (id) => call(apiClient.post(`/goals/${id}/recalculate-progress`)),
  setKeyResultValue: (id, keyResultId, currentValue) =>
    call(apiClient.patch(`/goals/${id}/key-results/${keyResultId}`, { currentValue })),
  getInsights: (id) => call(apiClient.get(`/goals/${id}/insights`)),
};
