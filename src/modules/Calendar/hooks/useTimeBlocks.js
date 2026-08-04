import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeBlockApi } from '../api/timeBlock.api';
import { invalidateCalendar } from './useCalendarEngine';

// Dragging a task onto the calendar grid.
export function useCreateTimeBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => timeBlockApi.create(payload),
    onSuccess: () => invalidateCalendar(queryClient),
  });
}

// Dragging a block's edges (resize) or body (reschedule).
export function useUpdateTimeBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => timeBlockApi.update(id, payload),
    onSuccess: () => invalidateCalendar(queryClient),
  });
}

// "Unschedule" — removes the block, the underlying task is untouched.
export function useDeleteTimeBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => timeBlockApi.delete(id),
    onSuccess: () => invalidateCalendar(queryClient),
  });
}
