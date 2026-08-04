import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyMemoryApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/memories`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/memories`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/memories/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/memories/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/memories/${id}`)),
  getTimeline: (householdId, params) => call(apiClient.get(`/family/${householdId}/timeline`, { params })),
};
