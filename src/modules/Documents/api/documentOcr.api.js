import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentOcrApi = {
  queueStatus: () => call(apiClient.get('/documents/ocr/queue-status')),
  processQueue: (limit) => call(apiClient.post('/documents/ocr/process-queue', { limit })),
  reprocess: (id) => call(apiClient.post(`/documents/${id}/ocr/reprocess`)),
};
