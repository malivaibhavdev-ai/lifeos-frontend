import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const contactApi = {
  list: (params) => call(apiClient.get('/contacts', { params })),
  getById: (id) => call(apiClient.get(`/contacts/${id}`)),
  create: (payload) => call(apiClient.post('/contacts', payload)),
  update: (id, payload) => call(apiClient.patch(`/contacts/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/contacts/${id}`)),
};
