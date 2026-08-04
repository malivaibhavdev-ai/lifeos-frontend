import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const skillApi = {
  list: (params) => call(apiClient.get('/skills', { params })),
  getById: (id) => call(apiClient.get(`/skills/${id}`)),
  create: (payload) => call(apiClient.post('/skills', payload)),
  update: (id, payload) => call(apiClient.patch(`/skills/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/skills/${id}`)),
  markPracticed: (id) => call(apiClient.patch(`/skills/${id}/practiced`)),
  bulkDelete: (ids) => call(apiClient.delete('/skills/bulk', { data: { ids } })),
};
