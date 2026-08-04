import { useQuery } from '@tanstack/react-query';
import { documentActivityLogApi } from '../api/documentActivityLog.api';

export function useDocumentActivityLog(params) {
  return useQuery({ queryKey: ['documentActivityLog', params], queryFn: () => documentActivityLogApi.list(params) });
}

export function useDocumentTimeline(params) {
  return useQuery({ queryKey: ['documentTimeline', params], queryFn: () => documentActivityLogApi.timeline(params) });
}
