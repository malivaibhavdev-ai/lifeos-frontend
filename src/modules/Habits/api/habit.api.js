import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const habitApi = {
  list: (params) => call(apiClient.get('/habits', { params })),
  getById: (id) => call(apiClient.get(`/habits/${id}`)),
  create: (payload) => call(apiClient.post('/habits', payload)),
  update: (id, payload) => call(apiClient.patch(`/habits/${id}`, payload)),
  archive: (id, isArchived) => call(apiClient.patch(`/habits/${id}/archive`, { isArchived })),
  delete: (id) => call(apiClient.delete(`/habits/${id}`)),
  reorder: (items) => call(apiClient.patch('/habits/reorder', { items })),

  logEntry: (id, payload) => call(apiClient.post(`/habits/${id}/log`, payload)),
  removeLastEntry: (id, date) => call(apiClient.delete(`/habits/${id}/log/${date}`)),
  setCompleted: (id, date, completed) => call(apiClient.post(`/habits/${id}/complete`, { date, completed })),
  setFrozen: (id, date, isFrozen) => call(apiClient.post(`/habits/${id}/freeze`, { date, isFrozen })),

  getLogs: (id, params) => call(apiClient.get(`/habits/${id}/logs`, { params })),
  getStreaks: (id) => call(apiClient.get(`/habits/${id}/streaks`)),
  getHeatmap: (id, params) => call(apiClient.get(`/habits/${id}/heatmap`, { params })),
  getStatistics: (id, params) => call(apiClient.get(`/habits/${id}/statistics`, { params })),
};
