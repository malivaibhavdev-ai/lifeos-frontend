import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentShareApi = {
  list: (documentId) => call(apiClient.get(`/documents/${documentId}/shares`)),
  create: (documentId, payload) => call(apiClient.post(`/documents/${documentId}/shares`, payload)),
  createPublicLink: (documentId, payload) => call(apiClient.post(`/documents/${documentId}/shares/public-link`, payload)),
  revoke: (documentId, shareId) => call(apiClient.delete(`/documents/${documentId}/shares/${shareId}`)),
  sharedWithMe: () => call(apiClient.get('/documents/shares/shared-with-me')),
  resolvePublicLink: (token) => call(apiClient.get(`/documents/shares/public/${token}`)),
};
