import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const notificationRuleApi = {
  list: () => call(apiClient.get('/notifications/rules')),
  create: (payload) => call(apiClient.post('/notifications/rules', payload)),
  getById: (id) => call(apiClient.get(`/notifications/rules/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/notifications/rules/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/notifications/rules/${id}`)),
};
