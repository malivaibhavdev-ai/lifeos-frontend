import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const knowledgeGraphApi = {
  getGraph: () => call(apiClient.get('/analytics/graph')),
};
