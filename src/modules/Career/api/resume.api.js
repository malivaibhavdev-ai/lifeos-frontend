import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const resumeApi = {
  list: () => call(apiClient.get('/resumes')),
  getById: (id) => call(apiClient.get(`/resumes/${id}`)),
  create: (payload) => call(apiClient.post('/resumes', payload)),
  update: (id, payload) => call(apiClient.patch(`/resumes/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/resumes/${id}`)),
  recordDownload: (id) => call(apiClient.patch(`/resumes/${id}/download`)),
  upload: (formData) => call(apiClient.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
};
