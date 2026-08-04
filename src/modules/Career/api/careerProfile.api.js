import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const careerProfileApi = {
  get: () => call(apiClient.get('/career-profile')),
  update: (payload) => call(apiClient.patch('/career-profile', payload)),
};
