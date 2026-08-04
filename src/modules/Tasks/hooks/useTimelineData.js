import { useMemo } from 'react';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useTaskList } from './useTasks';
import { useTaskQueryParams } from './useTaskQueryParams';

// Data layer for the (not-yet-rendered) Timeline/Gantt view — built ahead of
// the visualization itself so whoever implements the rendering doesn't also
// have to re-derive "which tasks span which dates". Each row has a start
// (startDate, falling back to dueDate) and an end (dueDate, falling back to
// startDate) so a task with only one of the two still gets a zero-width
// marker instead of being dropped.
export function useTimelineData() {
  const params = useTaskQueryParams({ view: 'all', sort: 'dueDate', sortDir: 'asc', limit: 300 });
  const { data, isLoading } = useTaskList(params);
  const tasks = data?.items ?? EMPTY_ARRAY;

  const rows = useMemo(
    () =>
      tasks
        .filter((t) => t.startDate || t.dueDate)
        .map((t) => ({
          task: t,
          start: t.startDate ?? t.dueDate,
          end: t.dueDate ?? t.startDate,
        })),
    [tasks]
  );

  return { rows, isLoading };
}
