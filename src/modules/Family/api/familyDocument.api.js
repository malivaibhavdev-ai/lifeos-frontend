import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyDocumentApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/documents`, { params })),
  create: (householdId, formData) =>
    call(apiClient.post(`/family/${householdId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/documents/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/documents/${id}`, payload)),
  replaceFile: (householdId, id, formData) =>
    call(
      apiClient.post(`/family/${householdId}/documents/${id}/replace-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/documents/${id}`)),
};
