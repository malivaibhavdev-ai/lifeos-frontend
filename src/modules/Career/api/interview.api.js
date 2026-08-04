import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const interviewApi = {
  list: (params) => call(apiClient.get('/interviews', { params })),
  upcoming: (limit) => call(apiClient.get('/interviews/upcoming', { params: { limit } })),
  getById: (id) => call(apiClient.get(`/interviews/${id}`)),
  create: (payload) => call(apiClient.post('/interviews', payload)),
  update: (id, payload) => call(apiClient.patch(`/interviews/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/interviews/${id}`)),
};
