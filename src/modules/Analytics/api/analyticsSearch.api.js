import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const analyticsSearchApi = {
  search: (query) => call(apiClient.get('/analytics/search', { params: { query } })),
  listSavedFilters: () => call(apiClient.get('/analytics/saved-filters')),
  createSavedFilter: (payload) => call(apiClient.post('/analytics/saved-filters', payload)),
  deleteSavedFilter: (id) => call(apiClient.delete(`/analytics/saved-filters/${id}`)),
};
