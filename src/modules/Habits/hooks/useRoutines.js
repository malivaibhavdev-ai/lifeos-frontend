import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { routineApi } from '../api/routine.api';

export const routineKeys = {
  all: ['routines'],
  lists: () => [...routineKeys.all, 'list'],
  list: (params) => [...routineKeys.lists(), params],
  detail: (id) => [...routineKeys.all, 'detail', id],
  progress: (id, date) => [...routineKeys.all, 'progress', id, date],
};

function invalidateRoutines(queryClient) {
  queryClient.invalidateQueries({ queryKey: routineKeys.all });
}

export function useRoutineList(params) {
  return useQuery({ queryKey: routineKeys.list(params), queryFn: () => routineApi.list(params) });
}

export function useRoutine(id) {
  return useQuery({ queryKey: routineKeys.detail(id), queryFn: () => routineApi.getById(id), enabled: Boolean(id) });
}

// Live-computed on the server from each member habit's log for `date` —
// re-fetch whenever habits data changes (see useHabits.js's
// invalidateHabits, which also invalidates habitKeys, not routineKeys;
// callers pair this with useHabitList's own invalidation naturally since
// completing a habit re-renders whatever screen is showing routine progress).
export function useRoutineProgress(id, date) {
  return useQuery({
    queryKey: routineKeys.progress(id, date),
    queryFn: () => routineApi.getProgress(id, date),
    enabled: Boolean(id && date),
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => routineApi.create(payload), onSuccess: () => invalidateRoutines(queryClient) });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => routineApi.update(id, payload),
    onSuccess: () => invalidateRoutines(queryClient),
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => routineApi.delete(id), onSuccess: () => invalidateRoutines(queryClient) });
}

export function useReorderRoutines() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (items) => routineApi.reorder(items), onSuccess: () => invalidateRoutines(queryClient) });
}
