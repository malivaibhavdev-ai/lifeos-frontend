import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

// The Health Hub aggregator — read-only summary composing every dedicated
// sub-module, not a data owner itself (see backend health.service.js).
export const healthApi = {
  getSummary: () => call(apiClient.get('/health/summary')),
};
