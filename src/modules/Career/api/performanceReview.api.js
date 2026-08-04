import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const performanceReviewApi = {
  list: () => call(apiClient.get('/performance-reviews')),
  getById: (id) => call(apiClient.get(`/performance-reviews/${id}`)),
  create: (payload) => call(apiClient.post('/performance-reviews', payload)),
  update: (id, payload) => call(apiClient.patch(`/performance-reviews/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/performance-reviews/${id}`)),
};
