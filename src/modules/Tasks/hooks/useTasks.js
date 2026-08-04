import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import { clearTaskReminders, syncTaskReminders } from '../../../services/notificationService';
import { taskMatchesView } from '../utils/viewMatcher';

export const taskKeys = {
  all: ['tasks'],
  lists: () => [...taskKeys.all, 'list'],
  list: (params) => [...taskKeys.lists(), params],
  counts: () => [...taskKeys.all, 'counts'],
  todaySummary: () => [...taskKeys.all, 'todaySummary'],
  meta: () => [...taskKeys.all, 'meta'],
  details: () => [...taskKeys.all, 'detail'],
  detail: (id) => [...taskKeys.details(), id],
};

function invalidateEverything(queryClient) {
  queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
  queryClient.invalidateQueries({ queryKey: taskKeys.counts() });
  queryClient.invalidateQueries({ queryKey: taskKeys.meta() });
}

// setQueriesData's updater only receives the old data, not the query key —
// so per-view filtering (see below) has to go through getQueriesData +
// individual setQueryData calls instead, keyed off each query's own `view`.
function getListCacheEntries(queryClient) {
  return queryClient.getQueriesData({ queryKey: taskKeys.lists() });
}

// Patches a single task's fields across every cached list, then drops it
// from any list whose smart-list filter it no longer matches (e.g.
// completing a task removes it from "Today" instantly instead of waiting on
// the post-mutation refetch to notice it no longer belongs there).
function updateTaskInListCaches(queryClient, taskId, updateFn) {
  getListCacheEntries(queryClient).forEach(([key, data]) => {
    if (!data?.items) return;
    const view = key[2]?.view;
    const items = data.items
      .map((t) => (t._id === taskId ? updateFn(t) : t))
      .filter((t) => taskMatchesView(t, view));
    queryClient.setQueryData(key, { ...data, items });
  });
}

function removeTasksFromListCaches(queryClient, taskIds) {
  const idSet = new Set(taskIds);
  getListCacheEntries(queryClient).forEach(([key, data]) => {
    if (!data?.items) return;
    queryClient.setQueryData(key, { ...data, items: data.items.filter((t) => !idSet.has(t._id)) });
  });
}

function markTasksCompletedInListCaches(queryClient, taskIds) {
  const idSet = new Set(taskIds);
  const completedAt = new Date().toISOString();
  getListCacheEntries(queryClient).forEach(([key, data]) => {
    if (!data?.items) return;
    const view = key[2]?.view;
    const items = data.items
      .map((t) => (idSet.has(t._id) ? { ...t, status: 'completed', completedAt } : t))
      .filter((t) => taskMatchesView(t, view));
    queryClient.setQueryData(key, { ...data, items });
  });
}

function reorderTaskInListCaches(queryClient, orderById) {
  getListCacheEntries(queryClient).forEach(([key, data]) => {
    if (!data?.items) return;
    const items = data.items
      .map((t) => (orderById.has(t._id) ? { ...t, order: orderById.get(t._id) } : t))
      .sort((a, b) => a.order - b.order);
    queryClient.setQueryData(key, { ...data, items });
  });
}

export function useTaskList(params) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskApi.list(params),
    placeholderData: (prev) => prev,
    staleTime: 15 * 1000,
  });
}

export function useTaskCounts() {
  return useQuery({
    queryKey: taskKeys.counts(),
    queryFn: () => taskApi.counts(),
    staleTime: 15 * 1000,
  });
}

export function useTaskTodaySummary() {
  return useQuery({
    queryKey: taskKeys.todaySummary(),
    queryFn: () => taskApi.todaySummary(),
    staleTime: 15 * 1000,
  });
}

export function useTaskMeta() {
  return useQuery({
    queryKey: taskKeys.meta(),
    queryFn: () => taskApi.meta(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => taskApi.create(payload),
    onSuccess: (task) => {
      invalidateEverything(queryClient);
      syncTaskReminders(task);
    },
  });
}

// Every mutation that can change a task's dueDate/reminders/title re-syncs
// its local on-device notifications afterward — centralized here so no
// caller can forget and leave a stale local reminder scheduled.
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => taskApi.update(id, payload),
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task._id), task);
      invalidateEverything(queryClient);
      syncTaskReminders(task);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      removeTasksFromListCaches(queryClient, [id]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_task, _error, id) => {
      invalidateEverything(queryClient);
      clearTaskReminders(id);
    },
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.restore(id),
    onSuccess: (task) => {
      invalidateEverything(queryClient);
      syncTaskReminders(task);
    },
  });
}

export function usePermanentDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.permanentDelete(id),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useDuplicateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.duplicate(id),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useArchiveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.archive(id),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useUnarchiveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.unarchive(id),
    onSuccess: () => invalidateEverything(queryClient),
  });
}

export function useMarkTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => taskApi.markStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      updateTaskInListCaches(queryClient, id, (t) => ({
        ...t,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : null,
      }));

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (task) => {
      if (!task?._id) return;
      queryClient.setQueryData(taskKeys.detail(task._id), task);
      invalidateEverything(queryClient);
      // A recurring task rolls forward to 'pending' with new reminder times
      // instead of terminally completing — re-sync rather than clear so the
      // next occurrence's reminders actually get scheduled.
      if (task.status === 'pending' && task.recurrence) syncTaskReminders(task);
      else if (task.status === 'completed' || task.status === 'cancelled') clearTaskReminders(task._id);
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, subtaskId }) => taskApi.toggleSubtask(id, subtaskId),
    onMutate: async ({ id, subtaskId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });
      const previous = queryClient.getQueryData(taskKeys.detail(id));

      queryClient.setQueryData(taskKeys.detail(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          subtasks: old.subtasks.map((s) => (s._id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s)),
        };
      });

      return { previous, id };
    },
    onError: (_err, _vars, context) => {
      if (context?.id) queryClient.setQueryData(taskKeys.detail(context.id), context.previous);
    },
    onSettled: (task) => {
      if (task?._id) queryClient.setQueryData(taskKeys.detail(task._id), task);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => taskApi.reorder(items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      const orderById = new Map(items.map(({ id, order }) => [id, order]));

      reorderTaskInListCaches(queryClient, orderById);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useBulkCompleteTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => taskApi.bulkComplete(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      markTasksCompletedInListCaches(queryClient, ids);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_result, _error, ids) => {
      invalidateEverything(queryClient);
      ids.forEach((id) => clearTaskReminders(id));
    },
  });
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => taskApi.bulkDelete(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      removeTasksFromListCaches(queryClient, ids);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_result, _error, ids) => {
      invalidateEverything(queryClient);
      ids.forEach((id) => clearTaskReminders(id));
    },
  });
}
