import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const certificationApi = {
  list: (params) => call(apiClient.get('/certifications', { params })),
  getById: (id) => call(apiClient.get(`/certifications/${id}`)),
  create: (payload) => call(apiClient.post('/certifications', payload)),
  update: (id, payload) => call(apiClient.patch(`/certifications/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/certifications/${id}`)),
};
