import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const deviceApi = {
  list: () => call(apiClient.get('/notifications/devices')),
  registerMobile: (payload) => call(apiClient.post('/notifications/devices/mobile', payload)),
  registerWeb: (payload) => call(apiClient.post('/notifications/devices/web', payload)),
  remove: (id) => call(apiClient.delete(`/notifications/devices/${id}`)),
  getVapidPublicKey: () => call(apiClient.get('/notifications/vapid-public-key')),
};
