import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const jobApplicationApi = {
  list: (params) => call(apiClient.get('/job-applications', { params })),
  getById: (id) => call(apiClient.get(`/job-applications/${id}`)),
  create: (payload) => call(apiClient.post('/job-applications', payload)),
  update: (id, payload) => call(apiClient.patch(`/job-applications/${id}`, payload)),
  updateStatus: (id, status, note) => call(apiClient.patch(`/job-applications/${id}/status`, { status, note })),
  delete: (id) => call(apiClient.delete(`/job-applications/${id}`)),
  funnel: () => call(apiClient.get('/job-applications/funnel')),
};
