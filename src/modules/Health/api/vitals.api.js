import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const vitalsApi = {
  list: (params) => call(apiClient.get('/vitals', { params })),
  getLatest: () => call(apiClient.get('/vitals/latest')),
  create: (payload) => call(apiClient.post('/vitals', payload)),
  update: (id, payload) => call(apiClient.patch(`/vitals/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/vitals/${id}`)),
};
