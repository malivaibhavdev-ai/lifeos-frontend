import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyEventApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/events`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/events`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/events/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/events/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/events/${id}`)),
  toggleChecklistItem: (householdId, id, itemId, isDone) =>
    call(apiClient.patch(`/family/${householdId}/events/${id}/checklist/${itemId}`, { isDone })),
  setGuestRsvp: (householdId, id, memberId, rsvp) =>
    call(apiClient.patch(`/family/${householdId}/events/${id}/guests/${memberId}/rsvp`, { rsvp })),
};
