import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const portfolioProjectApi = {
  list: (params) => call(apiClient.get('/portfolio-projects', { params })),
  getById: (id) => call(apiClient.get(`/portfolio-projects/${id}`)),
  create: (payload) => call(apiClient.post('/portfolio-projects', payload)),
  update: (id, payload) => call(apiClient.patch(`/portfolio-projects/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/portfolio-projects/${id}`)),
};
