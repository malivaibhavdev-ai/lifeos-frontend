import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { useCalendarUiStore } from '../store/calendarUiStore';
import { DayView } from '../views/DayView';
import { WeekView } from '../views/WeekView';
import { MonthView } from '../views/MonthView';
import { CalendarEventFormSheet } from '../components/CalendarEventFormSheet';
import { OccurrenceDetailSheet } from '../components/OccurrenceDetailSheet';
import { useCalendarEvent } from '../hooks/useCalendarEvents';

const MODES = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export function CalendarWorkspaceScreen() {
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = useCalendarUiStore((s) => s.viewMode);
  const setViewMode = useCalendarUiStore((s) => s.setViewMode);

  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [editingEventId, setEditingEventId] = useState(undefined); // undefined = closed, null = create, string = edit
  const { data: editingEvent } = useCalendarEvent(typeof editingEventId === 'string' ? editingEventId : null);

  // A reminder click for a calendarEvent (see the mobile app's
  // navigationRef.navigateToEntity) lands here via an `?openEventId=` query
  // param rather than local state, since this screen might not even be
  // mounted yet when the click happens. Cleared immediately after opening
  // so navigating away and back doesn't reopen the same sheet.
  useEffect(() => {
    const openEventId = searchParams.get('openEventId');
    if (openEventId) {
      setEditingEventId(openEventId);
      setSearchParams(
        (params) => {
          params.delete('openEventId');
          return params;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  // Stable identity so DayView/WeekView's OccurrenceBlock rows (wrapped in
  // React.memo) actually bail out on unrelated re-renders instead of every
  // occurrence block re-rendering whenever this screen re-renders.
  const handleOpenOccurrence = useCallback((occurrence) => {
    if (occurrence.entityType === 'calendarEvent') {
      setEditingEventId(occurrence.entityId);
    } else {
      setSelectedOccurrence(occurrence);
    }
  }, []);

  const activeView =
    viewMode === 'week' ? (
      <WeekView onOpenOccurrence={handleOpenOccurrence} />
    ) : viewMode === 'month' ? (
      <MonthView />
    ) : (
      <DayView onOpenOccurrence={handleOpenOccurrence} />
    );

  return (
    <Screen>
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</p>
        <button
          type="button"
          onClick={() => setEditingEventId(null)}
          aria-label="New event"
          className="h-9 w-9 flex items-center justify-center rounded-full bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div
        className="mx-4 mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900"
        role="tablist"
        aria-label="Calendar view mode"
      >
        {MODES.map((m) => (
          <button
            type="button"
            key={m.key}
            onClick={() => setViewMode(m.key)}
            role="tab"
            aria-selected={viewMode === m.key}
            className={`flex-1 flex flex-col items-center rounded-lg py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${viewMode === m.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <span
              className={`text-xs font-semibold ${
                viewMode === m.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {activeView}

      <OccurrenceDetailSheet occurrence={selectedOccurrence} onClose={() => setSelectedOccurrence(null)} />

      <CalendarEventFormSheet
        visible={editingEventId !== undefined}
        onClose={() => setEditingEventId(undefined)}
        event={editingEvent}
      />
    </Screen>
  );
}
