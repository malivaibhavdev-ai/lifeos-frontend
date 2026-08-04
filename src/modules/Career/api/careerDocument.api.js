import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const careerDocumentApi = {
  list: (params) => call(apiClient.get('/career-documents', { params })),
  getById: (id) => call(apiClient.get(`/career-documents/${id}`)),
  create: (payload) => call(apiClient.post('/career-documents', payload)),
  update: (id, payload) => call(apiClient.patch(`/career-documents/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/career-documents/${id}`)),
  upload: (formData) => call(apiClient.post('/career-documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
};
