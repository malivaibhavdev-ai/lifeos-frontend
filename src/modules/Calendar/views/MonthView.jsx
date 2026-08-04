import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import * as Haptics from '../../../services/haptics';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { dayKey, getMonthGrid, isSameDay, isSameMonth } from '../../../utils/calendarGrid';
import { useCalendarUiStore } from '../store/calendarUiStore';
import { useCalendarOccurrences } from '../hooks/useCalendarEngine';
import { groupOccurrencesByDay, resolveColor } from '../utils/occurrenceHelpers';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ROW_HEIGHT = 54;

function DayCell({ date, isCurrentMonth, isToday, dayOccurrences, onPress }) {
  const dotColors = [...new Set(dayOccurrences.map(resolveColor))].slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onPress(date)}
      aria-label={date.format('dddd, MMMM D')}
      className="flex flex-1 flex-col items-center justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-lg"
      style={{ paddingTop: 4, paddingBottom: 4 }}
    >
      <div className="h-7 w-7 flex items-center justify-center rounded-full" style={{ backgroundColor: isToday ? '#2563eb' : 'transparent' }}>
        <span
          className={`text-sm ${
            isToday
              ? 'font-bold text-white'
              : isCurrentMonth
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-300 dark:text-gray-700'
          }`}
        >
          {date.date()}
        </span>
      </div>
      {dotColors.length > 0 ? (
        <div className="mt-1 flex flex-row items-center gap-0.5">
          {dotColors.map((color) => (
            <div key={color} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
          {dayOccurrences.length > 3 ? <span className="ml-0.5 text-[9px] text-gray-400 dark:text-gray-500">+{dayOccurrences.length - 3}</span> : null}
        </div>
      ) : (
        <div className="mt-1 h-1.5" />
      )}
    </button>
  );
}

// Tapping a day jumps straight into Day view for that date — Month is a
// scan-and-navigate surface, not a place to inspect or schedule from
// directly (that's what Day/Week are for). The RN version's horizontal
// swipe-to-navigate gesture is dropped on web — the Prev/Next buttons below
// already cover the same navigation and a swipe gesture isn't a genuine
// cross-region drag (see UnscheduledTaskTray for the one that is), so it
// isn't a dnd-kit case either; flagged as a minor fidelity gap.
export function MonthView({ onSelectDay }) {
  const visibleDate = useCalendarUiStore((s) => s.visibleDate);
  const setVisibleDate = useCalendarUiStore((s) => s.setVisibleDate);
  const goToToday = useCalendarUiStore((s) => s.goToToday);
  const setViewMode = useCalendarUiStore((s) => s.setViewMode);

  const month = useMemo(() => dayjs(visibleDate), [visibleDate]);
  const gridDays = useMemo(() => getMonthGrid(month.year(), month.month()), [month]);

  const { from, to } = useMemo(
    () => ({ from: dayjs(gridDays[0]).startOf('day').toISOString(), to: dayjs(gridDays[41]).endOf('day').toISOString() }),
    [gridDays]
  );

  const { data } = useCalendarOccurrences(from, to);
  const byDay = useMemo(() => groupOccurrencesByDay(data ?? EMPTY_ARRAY), [data]);

  const goPrevMonth = () => setVisibleDate(month.subtract(1, 'month').toISOString());
  const goNextMonth = () => setVisibleDate(month.add(1, 'month').toISOString());

  const handleSelectDay = (date) => {
    Haptics.selectionAsync();
    setVisibleDate(date.toISOString());
    setViewMode('day');
    onSelectDay?.(date);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-row items-center justify-between px-4 pb-2">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Previous month"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
        >
          <Icon name="chevron-back" size={20} color="#64748b" />
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
        >
          <span className="text-base font-bold text-gray-900 dark:text-white">{month.format('MMMM YYYY')}</span>
        </button>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label="Next month"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
        >
          <Icon name="chevron-forward" size={20} color="#64748b" />
        </button>
      </div>

      {/* key={month.format(...)} retriggers the CSS fade-in on every month
          change, same as the RN version's Animated.View key + FadeIn. */}
      <div key={month.format('YYYY-MM')} className="animate-fade-in px-3">
        <div className="flex flex-row px-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} style={{ flex: 1 }} className="flex flex-col items-center">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">{label}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <div key={weekIndex} className="flex flex-row" style={{ height: ROW_HEIGHT }}>
            {gridDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => (
              <DayCell
                key={date.format('YYYY-MM-DD')}
                date={date}
                isCurrentMonth={isSameMonth(date, month)}
                isToday={isSameDay(date, dayjs())}
                dayOccurrences={byDay.get(dayKey(date)) ?? []}
                onPress={handleSelectDay}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
