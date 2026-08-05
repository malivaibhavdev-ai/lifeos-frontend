import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const notificationSearchApi = {
  search: (params) => call(apiClient.get('/notifications/search', { params })),
};
