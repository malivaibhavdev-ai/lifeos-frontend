import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const reportApi = {
  list: () => call(apiClient.get('/analytics/reports')),
  generate: (payload) => call(apiClient.post('/analytics/reports', payload)),
  getById: (id) => call(apiClient.get(`/analytics/reports/${id}`)),
  delete: (id) => call(apiClient.delete(`/analytics/reports/${id}`)),
  exportCSV: async (id) => (await apiClient.get(`/analytics/reports/${id}/export.csv`, { responseType: 'text' })).data,
  exportMarkdown: async (id) => (await apiClient.get(`/analytics/reports/${id}/export.md`, { responseType: 'text' })).data,
};
