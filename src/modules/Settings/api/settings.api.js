import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const settingsApi = {
  get: () => call(apiClient.get('/settings')),
  update: (payload) => call(apiClient.patch('/settings', payload)),
};
