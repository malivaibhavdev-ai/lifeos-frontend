import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const timeBlockApi = {
  create: (payload) => call(apiClient.post('/time-blocks', payload)),
  update: (id, payload) => call(apiClient.patch(`/time-blocks/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/time-blocks/${id}`)),
  list: (params) => call(apiClient.get('/time-blocks', { params })),
};
