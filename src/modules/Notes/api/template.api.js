import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const templateApi = {
  list: () => call(apiClient.get('/templates')),
  getById: (id) => call(apiClient.get(`/templates/${id}`)),
  create: (payload) => call(apiClient.post('/templates', payload)),
  update: (id, payload) => call(apiClient.patch(`/templates/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/templates/${id}`)),
};
