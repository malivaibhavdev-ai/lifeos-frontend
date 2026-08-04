import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const workHistoryApi = {
  list: () => call(apiClient.get('/work-history')),
  getById: (id) => call(apiClient.get(`/work-history/${id}`)),
  create: (payload) => call(apiClient.post('/work-history', payload)),
  update: (id, payload) => call(apiClient.patch(`/work-history/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/work-history/${id}`)),
  experience: () => call(apiClient.get('/work-history/experience')),
};
