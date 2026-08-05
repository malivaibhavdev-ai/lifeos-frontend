import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

// Every method here talks to a genuine AI-ready stub endpoint on the
// backend — each currently resolves { available: false, feature, reason }
// until real inference is wired up.
export const notificationAIApi = {
  prioritization: (id) => call(apiClient.get(`/notifications/ai/prioritization/${id}`)),
  summary: (payload) => call(apiClient.post('/notifications/ai/summary', payload ?? {})),
  digest: (payload) => call(apiClient.post('/notifications/ai/digest', payload ?? {})),
  smartTiming: (id) => call(apiClient.get(`/notifications/ai/smart-timing/${id}`)),
  smartDelivery: (id) => call(apiClient.get(`/notifications/ai/smart-delivery/${id}`)),
  recommendation: () => call(apiClient.get('/notifications/ai/recommendation')),
  reduction: () => call(apiClient.get('/notifications/ai/reduction')),
};
