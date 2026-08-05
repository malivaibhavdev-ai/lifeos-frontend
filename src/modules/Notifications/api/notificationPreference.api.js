import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const notificationPreferenceApi = {
  list: () => call(apiClient.get('/notifications/preferences')),
  upsertGlobal: (payload) => call(apiClient.put('/notifications/preferences', payload)),
  upsertCategory: (category, payload) => call(apiClient.put(`/notifications/preferences/${category}`, payload)),
  deleteCategory: (category) => call(apiClient.delete(`/notifications/preferences/${category}`)),
};
