import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { focusSessionApi } from '../api/focusSession.api';

export const focusKeys = {
  all: ['focusSessions'],
  active: () => [...focusKeys.all, 'active'],
  list: (params) => [...focusKeys.all, 'list', params],
  stats: (from, to) => [...focusKeys.all, 'stats', from, to],
};

function invalidateFocus(queryClient) {
  queryClient.invalidateQueries({ queryKey: focusKeys.all });
  // A completed/interrupted session can change a task's actualMinutes —
  // the Tasks module's own caches need to know too.
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
}

export function useActiveFocusSession() {
  return useQuery({
    queryKey: focusKeys.active(),
    queryFn: () => focusSessionApi.getActive(),
    staleTime: 10 * 1000,
  });
}

export function useFocusSessionHistory(params) {
  return useQuery({
    queryKey: focusKeys.list(params),
    queryFn: () => focusSessionApi.list(params),
  });
}

// `from`/`to` are ISO date strings — pass stable values (e.g. computed once
// per render via useMemo) to avoid needlessly refetching on every render.
export function useFocusStats(from, to) {
  return useQuery({
    queryKey: focusKeys.stats(from, to),
    queryFn: () => focusSessionApi.stats(from, to),
    staleTime: 30 * 1000,
  });
}

export function useStartFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => focusSessionApi.start(payload),
    onSuccess: () => invalidateFocus(queryClient),
  });
}

export function usePauseFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => focusSessionApi.pause(id),
    onSuccess: (session) => queryClient.setQueryData(focusKeys.active(), session),
  });
}

export function useResumeFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => focusSessionApi.resume(id),
    onSuccess: (session) => queryClient.setQueryData(focusKeys.active(), session),
  });
}

export function useCompleteFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => focusSessionApi.complete(id, notes),
    onSuccess: () => {
      queryClient.setQueryData(focusKeys.active(), null);
      invalidateFocus(queryClient);
    },
  });
}

export function useInterruptFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => focusSessionApi.interrupt(id, notes),
    onSuccess: () => {
      queryClient.setQueryData(focusKeys.active(), null);
      invalidateFocus(queryClient);
    },
  });
}
