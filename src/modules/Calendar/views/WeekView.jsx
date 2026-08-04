import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { getWeekGrid, isSameDay } from '../../../utils/calendarGrid';
import { useCalendarUiStore } from '../store/calendarUiStore';
import { useCalendarOccurrences } from '../hooks/useCalendarEngine';
import { OccurrenceBlock } from '../components/OccurrenceBlock';
import {
  HOUR_HEIGHT,
  assignOverlapColumns,
  groupOccurrencesByDay,
  minutesFromMidnight,
  minutesToY,
} from '../utils/occurrenceHelpers';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const LABEL_WIDTH = 40;

function formatHourLabel(hour) {
  if (hour === 0) return '12A';
  if (hour === 12) return '12P';
  return hour < 12 ? `${hour}A` : `${hour - 12}P`;
}

// Read-only — tap a block to open its detail sheet, which is also where
// rescheduling happens (start/end time fields). Live drag-to-resize is a
// Day-view-only interaction (see DayView's comment); giving every column in
// a 7-wide week grid its own drag target would be a much easier gesture to
// fat-finger than Day view's single wide column, so this deliberately
// keeps Week to tap-based editing — the same "defer the fragile version"
// call already made for Kanban's cross-column drag in the Tasks workspace.
export function WeekView({ onOpenOccurrence }) {
  const visibleDate = useCalendarUiStore((s) => s.visibleDate);
  const setVisibleDate = useCalendarUiStore((s) => s.setVisibleDate);
  const goToToday = useCalendarUiStore((s) => s.goToToday);

  const day = useMemo(() => dayjs(visibleDate), [visibleDate]);
  const weekDays = useMemo(() => getWeekGrid(day.toDate()), [day]);

  const { from, to } = useMemo(
    () => ({ from: dayjs(weekDays[0]).startOf('day').toISOString(), to: dayjs(weekDays[6]).endOf('day').toISOString() }),
    [weekDays]
  );

  const { data } = useCalendarOccurrences(from, to);
  const occurrences = data ?? EMPTY_ARRAY;
  const timedOccurrences = useMemo(() => occurrences.filter((o) => !o.allDay), [occurrences]);
  const byDay = useMemo(() => groupOccurrencesByDay(timedOccurrences), [timedOccurrences]);

  // Was previously computed inline in the render body on every render (even
  // when neither the visible week nor the occurrences had changed) — this
  // is the same union-find overlap-column math DayView already memoizes.
  // Memoizing it here also gives every day column's OccurrenceBlocks a
  // stable `dayDate` Date reference across renders, same reasoning as
  // DayView's `dayDate`.
  const dayColumns = useMemo(
    () =>
      weekDays.map((d) => {
        const key = d.format('YYYY-MM-DD');
        const dateObj = d.toDate();
        return { key, dateObj, laidOut: assignOverlapColumns(byDay.get(key) ?? EMPTY_ARRAY, dateObj) };
      }),
    [weekDays, byDay]
  );

  const goPrevWeek = () => setVisibleDate(day.subtract(1, 'week').toISOString());
  const goNextWeek = () => setVisibleDate(day.add(1, 'week').toISOString());

  const columnWidth = `${100 / 7}%`;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-row items-center justify-between px-4 pb-2">
        <button
          type="button"
          onClick={goPrevWeek}
          aria-label="Previous week"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
        >
          <Icon name="chevron-back" size={20} color="#64748b" />
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
        >
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {dayjs(weekDays[0]).format('MMM D')} – {dayjs(weekDays[6]).format('MMM D')}
          </span>
        </button>
        <button
          type="button"
          onClick={goNextWeek}
          aria-label="Next week"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
        >
          <Icon name="chevron-forward" size={20} color="#64748b" />
        </button>
      </div>

      <div className="flex flex-row border-b border-gray-100 dark:border-gray-800">
        <div style={{ width: LABEL_WIDTH }} />
        {weekDays.map((d) => {
          const isToday = isSameDay(d, dayjs());
          return (
            <div key={d.format('YYYY-MM-DD')} style={{ width: columnWidth }} className="items-center pb-2 flex flex-col">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{d.format('ddd')}</span>
              <div
                className="mt-0.5 h-6 w-6 items-center justify-center rounded-full flex"
                style={{ backgroundColor: isToday ? '#2563eb' : 'transparent' }}
              >
                <span className={`text-xs ${isToday ? 'font-bold text-white' : 'text-gray-900 dark:text-white'}`}>
                  {d.date()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-row" style={{ height: 24 * HOUR_HEIGHT }}>
          <div style={{ width: LABEL_WIDTH }}>
            {HOURS.map((hour) => (
              <div key={hour} style={{ height: HOUR_HEIGHT }} className="items-end border-t border-gray-100 pr-1 pt-0.5 dark:border-gray-800 flex flex-col">
                <span className="text-[9px] text-gray-400 dark:text-gray-500">{formatHourLabel(hour)}</span>
              </div>
            ))}
          </div>

          {dayColumns.map(({ key, dateObj, laidOut }) => (
            <div key={key} style={{ width: columnWidth, height: '100%', position: 'relative' }} className="border-l border-gray-50 dark:border-gray-900">
              {HOURS.map((hour) => (
                <div key={hour} style={{ position: 'absolute', top: hour * HOUR_HEIGHT, left: 0, right: 0, height: 1 }} className="bg-gray-100 dark:bg-gray-800" />
              ))}
              {isSameDay(dateObj, dayjs()) ? (
                <div
                  style={{ position: 'absolute', top: minutesToY(minutesFromMidnight(new Date(), dateObj)), left: 0, right: 0, height: 1.5, pointerEvents: 'none' }}
                  className="bg-danger"
                />
              ) : null}
              {laidOut.map((o) => (
                <OccurrenceBlock key={`${o.entityType}-${o.entityId}`} occurrence={o} dayDate={dateObj} onPress={onOpenOccurrence} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
