import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarEventApi } from '../api/calendarEvent.api';
import { invalidateCalendar } from './useCalendarEngine';
import { clearEntityReminders, syncEntityReminders } from '../../../services/notificationService';

const ENTITY_TYPE = 'calendarEvent';

function syncCalendarEventReminders(event) {
  syncEntityReminders({
    entityType: ENTITY_TYPE,
    entityId: event._id,
    title: event.title,
    body: event.notes,
    reminders: event.reminders,
  });
}

// Occurrences from the Calendar Engine only carry the display-weight
// fields; editing needs the full document (reminders, recurrence, notes),
// fetched on demand when the edit sheet opens rather than requested for
// every occurrence up front.
export function useCalendarEvent(id) {
  return useQuery({
    queryKey: ['calendarEvent', id],
    queryFn: () => calendarEventApi.getById(id),
    enabled: Boolean(id),
  });
}

// Every mutation that can change an event's startTime/reminders/title
// re-syncs its local on-device notifications afterward, same discipline as
// Tasks' useCreateTask/useUpdateTask/useDeleteTask.
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => calendarEventApi.create(payload),
    onSuccess: (event) => {
      invalidateCalendar(queryClient);
      syncCalendarEventReminders(event);
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => calendarEventApi.update(id, payload),
    onSuccess: (event) => {
      invalidateCalendar(queryClient);
      syncCalendarEventReminders(event);
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => calendarEventApi.delete(id),
    onSuccess: (_event, id) => {
      invalidateCalendar(queryClient);
      clearEntityReminders(ENTITY_TYPE, id);
    },
  });
}
