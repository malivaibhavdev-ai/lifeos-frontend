import { apiClient, toApiError, unwrap } from './client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

// Generic reminder API — deliberately not scoped under any single module's
// folder (Tasks, Habits, ...). Every module's reminders are acknowledged,
// listed, and cancelled through this same surface.
export const reminderApi = {
  list: (params) => call(apiClient.get('/reminders', { params })),

  upcoming: (limit) => call(apiClient.get('/reminders/upcoming', { params: { limit } })),

  getById: (id) => call(apiClient.get(`/reminders/${id}`)),

  events: (id) => call(apiClient.get(`/reminders/${id}/events`)),

  acknowledge: (id, { action, snoozeMinutes, newRemindAt, reason }) =>
    call(apiClient.post(`/reminders/${id}/acknowledge`, { action, snoozeMinutes, newRemindAt, reason })),

  markOpened: (id) => call(apiClient.post(`/reminders/${id}/opened`)),

  cancel: (id) => call(apiClient.delete(`/reminders/${id}`)),
};
