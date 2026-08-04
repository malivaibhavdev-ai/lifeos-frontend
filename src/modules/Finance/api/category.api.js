import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const categoryApi = {
  list: (params) => call(apiClient.get('/finance-categories', { params })),
  create: (payload) => call(apiClient.post('/finance-categories', payload)),
  update: (id, payload) => call(apiClient.patch(`/finance-categories/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/finance-categories/${id}`)),
};
