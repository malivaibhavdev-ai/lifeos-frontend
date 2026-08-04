import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const bodyMeasurementApi = {
  list: (params) => call(apiClient.get('/body-measurements', { params })),
  getLatest: () => call(apiClient.get('/body-measurements/latest')),
  create: (payload) => call(apiClient.post('/body-measurements', payload)),
  update: (id, payload) => call(apiClient.patch(`/body-measurements/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/body-measurements/${id}`)),
};
