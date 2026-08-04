import { useQuery } from '@tanstack/react-query';
import { calendarEngineApi } from '../api/calendarEngine.api';

export const calendarEngineKeys = {
  all: ['calendarEngine'],
  occurrences: (from, to, entityTypes) => [...calendarEngineKeys.all, 'occurrences', from, to, entityTypes?.join(',')],
};

// Every mutation that can change what shows up on the calendar (creating a
// CalendarEvent, scheduling/rescheduling a TimeBlock, completing a Task,
// starting/finishing a Focus Session) calls this — the calendar always
// reflects the true current state of every source module, never a stale
// cache of just one of them.
export function invalidateCalendar(queryClient) {
  queryClient.invalidateQueries({ queryKey: calendarEngineKeys.all });
}

// `from`/`to` are ISO date strings — compute them with useMemo at the call
// site so the query key stays stable across re-renders.
export function useCalendarOccurrences(from, to, entityTypes) {
  return useQuery({
    queryKey: calendarEngineKeys.occurrences(from, to, entityTypes),
    queryFn: () => calendarEngineApi.occurrences({ from, to, entityTypes }),
    enabled: Boolean(from && to),
    staleTime: 30 * 1000,
  });
}
