import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const weightApi = {
  list: (params) => call(apiClient.get('/weight', { params })),
  getLatest: () => call(apiClient.get('/weight/latest')),
  create: (payload) => call(apiClient.post('/weight', payload)),
  update: (id, payload) => call(apiClient.patch(`/weight/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/weight/${id}`)),
};
