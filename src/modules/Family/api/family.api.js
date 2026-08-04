import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/members`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/members`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/members/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/members/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/members/${id}`)),

  addGrowthEntry: (householdId, id, entry) => call(apiClient.post(`/family/${householdId}/members/${id}/growth`, entry)),
  updateElderCare: (householdId, id, elderCare) =>
    call(apiClient.patch(`/family/${householdId}/members/${id}/elder-care`, elderCare)),

  addRelationship: (householdId, payload) => call(apiClient.post(`/family/${householdId}/relationships`, payload)),
  removeRelationship: (householdId, relationshipId) =>
    call(apiClient.delete(`/family/${householdId}/relationships/${relationshipId}`)),
  getTree: (householdId) => call(apiClient.get(`/family/${householdId}/tree`)),

  getDashboard: (householdId) => call(apiClient.get(`/family/${householdId}/dashboard`)),
  upcomingBirthdays: (householdId, days) => call(apiClient.get(`/family/${householdId}/birthdays/upcoming`, { params: { days } })),
  getActivityLog: (householdId, params) => call(apiClient.get(`/family/${householdId}/activity-log`, { params })),

  exportAll: (householdId) => call(apiClient.get(`/family/${householdId}/export`)),
  importAll: (householdId, payload) => call(apiClient.post(`/family/${householdId}/import`, payload)),
};
