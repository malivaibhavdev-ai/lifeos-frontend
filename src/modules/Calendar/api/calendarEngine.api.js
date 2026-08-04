import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const calendarEngineApi = {
  // Single source of truth for everything scheduled — Calendar Events,
  // Tasks, Time Blocks, Focus Sessions today; any future dated module
  // without a client change, since the server merges providers by key.
  occurrences: ({ from, to, entityTypes }) =>
    call(apiClient.get('/calendar-engine/occurrences', { params: { from, to, entityTypes: entityTypes?.join(',') } })),

  freeBusy: ({ from, to, entityTypes }) =>
    call(apiClient.get('/calendar-engine/free-busy', { params: { from, to, entityTypes: entityTypes?.join(',') } })),
};
