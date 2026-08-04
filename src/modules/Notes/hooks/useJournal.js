import { useQuery, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '../api/journal.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const journalKeys = {
  all: ['journal'],
  lists: () => [...journalKeys.all, 'list'],
  list: (params) => [...journalKeys.lists(), params],
  detail: (id) => [...journalKeys.all, 'detail', id],
  byDate: (date) => [...journalKeys.all, 'byDate', date],
  streak: () => [...journalKeys.all, 'streak'],
};

function invalidateJournal(queryClient) {
  queryClient.invalidateQueries({ queryKey: journalKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useJournalList(params) {
  return useQuery({ queryKey: journalKeys.list(params), queryFn: () => journalApi.list(params) });
}

export function useJournalEntry(id) {
  return useQuery({ queryKey: journalKeys.detail(id), queryFn: () => journalApi.getById(id), enabled: Boolean(id) });
}

// The Daily Note entry point — auto-creates today's (or any date's) entry
// server-side on first read, so the editor always has a document to bind to.
export function useDailyNote(date) {
  return useQuery({ queryKey: journalKeys.byDate(date), queryFn: () => journalApi.getByDate(date), enabled: Boolean(date) });
}

export function useWritingStreak() {
  return useQuery({ queryKey: journalKeys.streak(), queryFn: () => journalApi.writingStreak() });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'journalEntry', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/journal/${id}`,
    apiCall: ({ id, payload }) => journalApi.update(id, payload),
    onSuccess: () => invalidateJournal(queryClient),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'journalEntry', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/journal/${id}`,
    apiCall: (id) => journalApi.delete(id),
    onSuccess: () => invalidateJournal(queryClient),
  });
}
