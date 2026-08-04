import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const emergencyContactApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/emergency-contacts`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/emergency-contacts`, payload)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/emergency-contacts/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/emergency-contacts/${id}`)),
  getEmergencyCenter: (householdId) => call(apiClient.get(`/family/${householdId}/emergency-center`)),
  getMedicalOverview: (householdId) => call(apiClient.get(`/family/${householdId}/medical-overview`)),
};
