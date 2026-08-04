import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentSearchApi = {
  search: (params) => call(apiClient.get('/documents/search', { params })),
  searchFolders: (query) => call(apiClient.get('/documents/search/folders', { params: { query } })),
  listSavedSearches: () => call(apiClient.get('/documents/saved-searches')),
  createSavedSearch: (payload) => call(apiClient.post('/documents/saved-searches', payload)),
  runSavedSearch: (id) => call(apiClient.post(`/documents/saved-searches/${id}/run`)),
  deleteSavedSearch: (id) => call(apiClient.delete(`/documents/saved-searches/${id}`)),
};
