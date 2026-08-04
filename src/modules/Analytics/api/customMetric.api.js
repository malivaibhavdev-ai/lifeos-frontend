import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const customMetricApi = {
  list: () => call(apiClient.get('/analytics/metrics')),
  create: (payload) => call(apiClient.post('/analytics/metrics', payload)),
  getById: (id) => call(apiClient.get(`/analytics/metrics/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/analytics/metrics/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/analytics/metrics/${id}`)),
  evaluate: (id, params) => call(apiClient.get(`/analytics/metrics/${id}/evaluate`, { params })),
};
