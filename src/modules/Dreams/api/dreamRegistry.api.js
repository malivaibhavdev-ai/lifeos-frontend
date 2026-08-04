import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

const PATHS = { symbol: 'symbols', person: 'people', place: 'places' };

// One thin client for all three registries (symbols/people/places) — same
// shape of endpoint, only the path segment differs.
export const dreamRegistryApi = {
  list: (kind, params) => call(apiClient.get(`/dreams/${PATHS[kind]}`, { params })),
  getById: (kind, id) => call(apiClient.get(`/dreams/${PATHS[kind]}/${id}`)),
  update: (kind, id, payload) => call(apiClient.patch(`/dreams/${PATHS[kind]}/${id}`, payload)),
};
