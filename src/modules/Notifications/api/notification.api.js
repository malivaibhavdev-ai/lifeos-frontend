import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const notificationApi = {
  list: (params) => call(apiClient.get('/notifications', { params })),
  getDashboard: () => call(apiClient.get('/notifications/dashboard')),
  send: (payload) => call(apiClient.post('/notifications', payload)),
  getById: (id) => call(apiClient.get(`/notifications/${id}`)),
  markRead: (id) => call(apiClient.patch(`/notifications/${id}/read`)),
  markUnread: (id) => call(apiClient.patch(`/notifications/${id}/unread`)),
  markAllRead: () => call(apiClient.patch('/notifications/read-all')),
  setArchived: (id, value) => call(apiClient.patch(`/notifications/${id}/archive`, { value })),
  setPinned: (id, value) => call(apiClient.patch(`/notifications/${id}/pin`, { value })),
  setFavorite: (id, value) => call(apiClient.patch(`/notifications/${id}/favorite`, { value })),
  executeAction: (id, actionKey, payload) => call(apiClient.post(`/notifications/${id}/actions/${actionKey}`, payload ?? {})),
  delete: (id) => call(apiClient.delete(`/notifications/${id}`)),
  bulkUpdate: (ids, payload) => call(apiClient.post('/notifications/bulk/update', { ids, payload })),
  bulkDelete: (ids) => call(apiClient.post('/notifications/bulk/delete', { ids })),
  broadcastToHousehold: (householdId, payload) => call(apiClient.post(`/notifications/household/${householdId}/broadcast`, payload)),
};
