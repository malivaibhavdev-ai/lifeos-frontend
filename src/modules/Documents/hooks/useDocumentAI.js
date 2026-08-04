import { useMutation } from '@tanstack/react-query';
import { documentAIApi } from '../api/documentAI.api';

// Every AI action returns `{available:false, ...}` today (see the backend's
// documentAI.service.js) — these hooks exist so screens can be wired
// against the final contract now and simply start receiving real answers
// later, same rationale as Family/Dreams' AI hooks.
export function useAutoCategorize() {
  return useMutation({ mutationFn: (id) => documentAIApi.autoCategorize(id) });
}
export function useSummarizeDocument() {
  return useMutation({ mutationFn: (id) => documentAIApi.summarize(id) });
}
export function useExtractKeyPoints() {
  return useMutation({ mutationFn: (id) => documentAIApi.extractKeyPoints(id) });
}
export function useAskDocument() {
  return useMutation({ mutationFn: ({ id, question }) => documentAIApi.ask(id, question) });
}
export function useContractReview() {
  return useMutation({ mutationFn: (id) => documentAIApi.contractReview(id) });
}
export function useResumeParsing() {
  return useMutation({ mutationFn: (id) => documentAIApi.resumeParsing(id) });
}
export function useInvoiceParsing() {
  return useMutation({ mutationFn: (id) => documentAIApi.invoiceParsing(id) });
}
export function useReceiptParsing() {
  return useMutation({ mutationFn: (id) => documentAIApi.receiptParsing(id) });
}
export function useMedicalAnalysis() {
  return useMutation({ mutationFn: (id) => documentAIApi.medicalAnalysis(id) });
}
export function useLegalReview() {
  return useMutation({ mutationFn: (id) => documentAIApi.legalReview(id) });
}
export function useRiskDetection() {
  return useMutation({ mutationFn: (id) => documentAIApi.riskDetection(id) });
}
export function useSmartFolderSuggestions() {
  return useMutation({ mutationFn: (id) => documentAIApi.smartFolderSuggestions(id) });
}
export function useKnowledgeGraphSuggestions() {
  return useMutation({ mutationFn: (id) => documentAIApi.knowledgeGraphSuggestions(id) });
}
export function useCompareDocumentsAI() {
  return useMutation({ mutationFn: ({ documentIdA, documentIdB }) => documentAIApi.compareDocuments(documentIdA, documentIdB) });
}
export function useSemanticSearch() {
  return useMutation({ mutationFn: (query) => documentAIApi.semanticSearch(query) });
}
export function useChatWithDocuments() {
  return useMutation({ mutationFn: (query) => documentAIApi.chatWithDocuments(query) });
}
export function useVoiceAssistant() {
  return useMutation({ mutationFn: (query) => documentAIApi.voiceAssistant(query) });
}
