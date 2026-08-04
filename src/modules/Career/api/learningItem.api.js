import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const learningItemApi = {
  list: (params) => call(apiClient.get('/learning-items', { params })),
  getById: (id) => call(apiClient.get(`/learning-items/${id}`)),
  create: (payload) => call(apiClient.post('/learning-items', payload)),
  update: (id, payload) => call(apiClient.patch(`/learning-items/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/learning-items/${id}`)),
  totalHours: () => call(apiClient.get('/learning-items/total-hours')),
};
