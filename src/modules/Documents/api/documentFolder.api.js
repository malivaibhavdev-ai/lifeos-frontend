import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentFolderApi = {
  list: (params) => call(apiClient.get('/documents/folders', { params })),
  tree: () => call(apiClient.get('/documents/folders/tree')),
  create: (payload) => call(apiClient.post('/documents/folders', payload)),
  getById: (id) => call(apiClient.get(`/documents/folders/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/documents/folders/${id}`, payload)),
  delete: (id, force) => call(apiClient.delete(`/documents/folders/${id}`, { params: { force } })),
  move: (id, parent) => call(apiClient.patch(`/documents/folders/${id}/move`, { parent })),
  setPinned: (id, value) => call(apiClient.patch(`/documents/folders/${id}/pin`, { value })),
  setFavorite: (id, value) => call(apiClient.patch(`/documents/folders/${id}/favorite`, { value })),
  setHidden: (id, value) => call(apiClient.patch(`/documents/folders/${id}/hide`, { value })),
  setArchived: (id, value) => call(apiClient.patch(`/documents/folders/${id}/archive`, { value })),
  setLock: (id, password) => call(apiClient.post(`/documents/folders/${id}/lock`, { password })),
  verifyLock: (id, password) => call(apiClient.post(`/documents/folders/${id}/lock/verify`, { password })),
  stats: (id) => call(apiClient.get(`/documents/folders/${id}/stats`)),
};
