import { useQuery, useQueryClient } from '@tanstack/react-query';
import { habitApi } from '../api/habit.api';
import { useOfflineMutation } from '../../../services/offlineSync';
import { syncHabitReminders, clearHabitReminders } from '../services/habitReminders';

export const habitKeys = {
  all: ['habits'],
  lists: () => [...habitKeys.all, 'list'],
  list: (params) => [...habitKeys.lists(), params],
  detail: (id) => [...habitKeys.all, 'detail', id],
  logs: (id, params) => [...habitKeys.all, 'logs', id, params],
  streaks: (id) => [...habitKeys.all, 'streaks', id],
  heatmap: (id, params) => [...habitKeys.all, 'heatmap', id, params],
  statistics: (id, params) => [...habitKeys.all, 'statistics', id, params],
};

function invalidateHabits(queryClient) {
  queryClient.invalidateQueries({ queryKey: habitKeys.all });
  // A habit's streak/completion feeds the dashboard widget and the unified
  // calendar (a habit occurrence's isCompleted comes from the same log).
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useHabitList(params) {
  return useQuery({ queryKey: habitKeys.list(params), queryFn: () => habitApi.list(params) });
}

export function useHabit(id) {
  return useQuery({ queryKey: habitKeys.detail(id), queryFn: () => habitApi.getById(id), enabled: Boolean(id) });
}

export function useHabitLogs(id, params) {
  return useQuery({ queryKey: habitKeys.logs(id, params), queryFn: () => habitApi.getLogs(id, params), enabled: Boolean(id) });
}

export function useHabitStreaks(id) {
  return useQuery({ queryKey: habitKeys.streaks(id), queryFn: () => habitApi.getStreaks(id), enabled: Boolean(id) });
}

export function useHabitHeatmap(id, params) {
  return useQuery({ queryKey: habitKeys.heatmap(id, params), queryFn: () => habitApi.getHeatmap(id, params), enabled: Boolean(id) });
}

export function useHabitStatistics(id, params) {
  return useQuery({ queryKey: habitKeys.statistics(id, params), queryFn: () => habitApi.getStatistics(id, params), enabled: Boolean(id) });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/habits',
    apiCall: (payload) => habitApi.create(payload),
    onSuccess: (habit) => {
      invalidateHabits(queryClient);
      if (habit && !habit.queued) syncHabitReminders(habit);
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/habits/${id}`,
    apiCall: ({ id, payload }) => habitApi.update(id, payload),
    onSuccess: (habit) => {
      invalidateHabits(queryClient);
      if (habit && !habit.queued) syncHabitReminders(habit);
    },
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/habits/${id}/archive`,
    apiCall: ({ id, isArchived }) => habitApi.archive(id, isArchived),
    onSuccess: () => invalidateHabits(queryClient),
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/habits/${id}`,
    apiCall: (id) => habitApi.delete(id),
    onSuccess: (_result, id) => {
      invalidateHabits(queryClient);
      clearHabitReminders(id);
    },
  });
}

export function useReorderHabits() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'update',
    method: 'PATCH',
    buildUrl: () => '/habits/reorder',
    apiCall: (items) => habitApi.reorder(items),
    onSuccess: () => invalidateHabits(queryClient),
  });
}

// Quick-tap completion for a boolean habit.
export function useSetHabitCompleted() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'update',
    method: 'POST',
    buildUrl: ({ id }) => `/habits/${id}/complete`,
    apiCall: ({ id, date, completed }) => habitApi.setCompleted(id, date, completed),
    onSuccess: () => invalidateHabits(queryClient),
  });
}

// Multi-entry logging for quantity/time habits (and boolean habits logged
// more than once a day).
export function useLogHabitEntry() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'update',
    method: 'POST',
    buildUrl: ({ id }) => `/habits/${id}/log`,
    apiCall: ({ id, ...payload }) => habitApi.logEntry(id, payload),
    onSuccess: () => invalidateHabits(queryClient),
  });
}

export function useRemoveLastHabitEntry() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: ({ id, date }) => `/habits/${id}/log/${date}`,
    apiCall: ({ id, date }) => habitApi.removeLastEntry(id, date),
    onSuccess: () => invalidateHabits(queryClient),
  });
}

export function useSetHabitFrozen() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'habit',
    opType: 'update',
    method: 'POST',
    buildUrl: ({ id }) => `/habits/${id}/freeze`,
    apiCall: ({ id, date, isFrozen }) => habitApi.setFrozen(id, date, isFrozen),
    onSuccess: () => invalidateHabits(queryClient),
  });
}
