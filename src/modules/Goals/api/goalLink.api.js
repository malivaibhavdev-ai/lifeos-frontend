import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const goalLinkApi = {
  link: (payload) => call(apiClient.post('/goal-links', payload)),
  // DELETE with a body — axios requires it under `data`, not as a second
  // positional arg like post/patch.
  unlink: (payload) => call(apiClient.delete('/goal-links', { data: payload })),
  listForOwner: (ownerType, ownerId) => call(apiClient.get(`/goal-links/owner/${ownerType}/${ownerId}`)),
  listForLinked: (linkedType, linkedId) => call(apiClient.get(`/goal-links/linked/${linkedType}/${linkedId}`)),
};
