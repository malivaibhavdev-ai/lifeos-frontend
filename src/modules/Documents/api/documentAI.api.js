import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentAIApi = {
  autoCategorize: (id) => call(apiClient.post(`/documents/${id}/ai/auto-categorize`)),
  summarize: (id) => call(apiClient.post(`/documents/${id}/ai/summarize`)),
  extractKeyPoints: (id) => call(apiClient.post(`/documents/${id}/ai/key-points`)),
  ask: (id, question) => call(apiClient.post(`/documents/${id}/ai/ask`, { question })),
  contractReview: (id) => call(apiClient.post(`/documents/${id}/ai/contract-review`)),
  resumeParsing: (id) => call(apiClient.post(`/documents/${id}/ai/resume-parsing`)),
  invoiceParsing: (id) => call(apiClient.post(`/documents/${id}/ai/invoice-parsing`)),
  receiptParsing: (id) => call(apiClient.post(`/documents/${id}/ai/receipt-parsing`)),
  medicalAnalysis: (id) => call(apiClient.post(`/documents/${id}/ai/medical-analysis`)),
  legalReview: (id) => call(apiClient.post(`/documents/${id}/ai/legal-review`)),
  riskDetection: (id) => call(apiClient.post(`/documents/${id}/ai/risk-detection`)),
  smartFolderSuggestions: (id) => call(apiClient.post(`/documents/${id}/ai/smart-folder-suggestions`)),
  knowledgeGraphSuggestions: (id) => call(apiClient.post(`/documents/${id}/ai/knowledge-graph-suggestions`)),
  compareDocuments: (documentIdA, documentIdB) => call(apiClient.post('/documents/ai/compare', { documentIdA, documentIdB })),
  semanticSearch: (query) => call(apiClient.post('/documents/ai/semantic-search', { query })),
  chatWithDocuments: (query) => call(apiClient.post('/documents/ai/chat', { query })),
  voiceAssistant: (query) => call(apiClient.post('/documents/ai/voice-assistant', { query })),
};
