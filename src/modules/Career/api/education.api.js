import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const educationApi = {
  list: () => call(apiClient.get('/education')),
  getById: (id) => call(apiClient.get(`/education/${id}`)),
  create: (payload) => call(apiClient.post('/education', payload)),
  update: (id, payload) => call(apiClient.patch(`/education/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/education/${id}`)),
};
