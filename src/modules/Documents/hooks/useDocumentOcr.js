import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { documentOcrApi } from '../api/documentOcr.api';
import { documentKeys } from './useDocuments';

export function useOcrQueueStatus() {
  return useQuery({ queryKey: ['documentOcrQueue'], queryFn: () => documentOcrApi.queueStatus(), refetchInterval: 15000 });
}

export function useProcessOcrQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (limit) => documentOcrApi.processQueue(limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentOcrQueue'] });
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useReprocessOcr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentOcrApi.reprocess(id),
    onSuccess: (_, id) => queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) }),
  });
}
