import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const accountApi = {
  list: (params) => call(apiClient.get('/accounts', { params })),
  getById: (id) => call(apiClient.get(`/accounts/${id}`)),
  create: (payload) => call(apiClient.post('/accounts', payload)),
  update: (id, payload) => call(apiClient.patch(`/accounts/${id}`, payload)),
  archive: (id) => call(apiClient.post(`/accounts/${id}/archive`)),
  recalculateBalance: (id) => call(apiClient.post(`/accounts/${id}/recalculate-balance`)),
  delete: (id) => call(apiClient.delete(`/accounts/${id}`)),
};
