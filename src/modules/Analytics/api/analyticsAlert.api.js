import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const analyticsAlertApi = {
  listRules: () => call(apiClient.get('/analytics/alert-rules')),
  createRule: (payload) => call(apiClient.post('/analytics/alert-rules', payload)),
  updateRule: (id, payload) => call(apiClient.patch(`/analytics/alert-rules/${id}`, payload)),
  deleteRule: (id) => call(apiClient.delete(`/analytics/alert-rules/${id}`)),
  evaluateNow: () => call(apiClient.post('/analytics/alert-rules/evaluate-now')),

  listAlerts: (params) => call(apiClient.get('/analytics/alerts', { params })),
  markRead: (id) => call(apiClient.patch(`/analytics/alerts/${id}/read`)),
  markAllRead: () => call(apiClient.patch('/analytics/alerts/read-all')),
};
