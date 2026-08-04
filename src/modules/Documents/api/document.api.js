import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentApi = {
  list: (params) => call(apiClient.get('/documents', { params })),
  create: (formData) => call(apiClient.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  trash: (params) => call(apiClient.get('/documents/trash', { params })),
  duplicates: () => call(apiClient.get('/documents/duplicates')),
  bulkMove: (ids, folder) => call(apiClient.post('/documents/bulk/move', { ids, folder })),
  bulkTag: (ids, tags) => call(apiClient.post('/documents/bulk/tag', { ids, tags })),
  bulkArchive: (ids, isArchived) => call(apiClient.post('/documents/bulk/archive', { ids, isArchived })),
  bulkDelete: (ids) => call(apiClient.post('/documents/bulk/delete', { ids })),

  getById: (id) => call(apiClient.get(`/documents/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/documents/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/documents/${id}`)),
  restore: (id) => call(apiClient.post(`/documents/${id}/restore`)),
  permanentlyDelete: (id) => call(apiClient.delete(`/documents/${id}/permanent`)),

  uploadVersion: (id, formData) =>
    call(apiClient.post(`/documents/${id}/versions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  listVersions: (id) => call(apiClient.get(`/documents/${id}/versions`)),
  compareVersions: (id, a, b) => call(apiClient.get(`/documents/${id}/versions/compare`, { params: { a, b } })),
  restoreVersion: (id, versionNumber) => call(apiClient.post(`/documents/${id}/versions/${versionNumber}/restore`)),

  setFavorite: (id, value) => call(apiClient.patch(`/documents/${id}/favorite`, { value })),
  setPinned: (id, value) => call(apiClient.patch(`/documents/${id}/pin`, { value })),
  setArchived: (id, value) => call(apiClient.patch(`/documents/${id}/archive`, { value })),
  setLock: (id, password) => call(apiClient.post(`/documents/${id}/lock`, { password })),
  verifyLock: (id, password) => call(apiClient.post(`/documents/${id}/lock/verify`, { password })),
  move: (id, folder) => call(apiClient.patch(`/documents/${id}/move`, { folder })),
  copy: (id, folder) => call(apiClient.post(`/documents/${id}/copy`, { folder })),
  recordDownload: (id) => call(apiClient.post(`/documents/${id}/download`)),
};
