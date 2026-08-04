import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const searchApi = {
  search: (q, types) => call(apiClient.get('/search', { params: { q, types: types?.join(',') } })),
  byTag: (tag) => call(apiClient.get(`/search/tag/${tag}`)),
};

export const savedSearchApi = {
  list: () => call(apiClient.get('/saved-searches')),
  create: (payload) => call(apiClient.post('/saved-searches', payload)),
  delete: (id) => call(apiClient.delete(`/saved-searches/${id}`)),
};
