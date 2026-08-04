import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const knowledgeLinkApi = {
  link: (payload) => call(apiClient.post('/knowledge-links', payload)),
  unlink: (payload) => call(apiClient.delete('/knowledge-links', { data: payload })),
  listForOwner: (ownerType, ownerId) => call(apiClient.get(`/knowledge-links/owner/${ownerType}/${ownerId}`)),
  listForLinked: (linkedType, linkedId) => call(apiClient.get(`/knowledge-links/linked/${linkedType}/${linkedId}`)),
};
