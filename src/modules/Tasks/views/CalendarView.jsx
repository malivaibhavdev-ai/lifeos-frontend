import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { Icon } from '../../../components/ui/Icon';
import { selectionAsync } from '../../../services/haptics';
import { TaskListItem } from '../components/TaskListItem';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PRIORITY } from '../constants/taskConstants';
import { dayKey, getMonthGrid, getWeekGrid, groupTasksByDay, isSameDay, isSameMonth } from '../utils/calendarGrid';
import { useTaskList } from '../hooks/useTasks';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskQueryParams } from '../hooks/useTaskQueryParams';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CALENDAR_MODES = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'agenda', label: 'Agenda' },
];
const MONTH_ROW_HEIGHT = 54;
const WEEK_ROW_HEIGHT = 64;

function highestPriorityColor(tasks) {
  const order = ['urgent', 'high', 'medium', 'low'];
  for (const level of order) {
    if (tasks.some((t) => t.priority === level)) return PRIORITY[level].color;
  }
  return PRIORITY.medium.color;
}

function DayCell({ date, isCurrentMonth, isSelected, isToday, dayTasks, onPress, compact }) {
  return (
    <button
      type="button"
      onClick={() => onPress(date)}
      aria-label={date.format('dddd, MMMM D')}
      aria-pressed={isSelected}
      className="flex flex-1 flex-col items-center justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-lg"
      style={{ paddingTop: compact ? 10 : 4, paddingBottom: compact ? 10 : 4 }}
    >
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: isSelected ? '#2563eb' : isToday ? '#dbeafe' : 'transparent' }}
      >
        <span
          className={`text-sm ${isSelected ? 'font-bold text-white' : isToday ? 'font-bold text-primary-600' : isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}
        >
          {date.date()}
        </span>
      </div>
      {dayTasks.length > 0 ? (
        <div className="mt-1 flex flex-row items-center">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: highestPriorityColor(dayTasks) }} />
          {dayTasks.length > 1 ? <span className="ml-0.5 text-[10px] text-gray-400 dark:text-gray-500">{dayTasks.length}</span> : null}
        </div>
      ) : (
        <div className="mt-1 h-1.5" />
      )}
    </button>
  );
}

export function CalendarView() {
  const [mode, setMode] = useState('month');
  const [visibleDate, setVisibleDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const params = useTaskQueryParams({ view: 'all', sort: 'dueDate', sortDir: 'asc', limit: 300 });
  const { data } = useTaskList(params);
  const tasks = data?.items ?? EMPTY_ARRAY;
  const datedTasks = useMemo(() => tasks.filter((t) => t.dueDate), [tasks]);
  const byDay = useMemo(() => groupTasksByDay(datedTasks), [datedTasks]);

  const { handlePress, handleToggleComplete, handleDelete, handleLongPressSelect, isSelectionMode } = useTaskActions();

  const goToToday = () => {
    selectionAsync();
    setVisibleDate(dayjs());
    setSelectedDate(dayjs());
  };

  const goPrev = () => setVisibleDate((d) => (mode === 'week' ? d.subtract(1, 'week') : d.subtract(1, 'month')));
  const goNext = () => setVisibleDate((d) => (mode === 'week' ? d.add(1, 'week') : d.add(1, 'month')));

  const gridDays = mode === 'week' ? getWeekGrid(visibleDate) : getMonthGrid(visibleDate.year(), visibleDate.month());
  const selectedDayTasks = byDay.get(dayKey(selectedDate)) ?? [];

  const agendaItems = useMemo(() => {
    const upcoming = datedTasks
      .filter((t) => t.status !== 'completed' && dayjs(t.dueDate).isAfter(dayjs().subtract(1, 'day')))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const items = [];
    let lastKey = null;
    for (const task of upcoming) {
      const key = dayKey(task.dueDate);
      if (key !== lastKey) {
        items.push({ type: 'header', id: `header-${key}`, label: dayjs(task.dueDate).format('dddd, MMM D') });
        lastKey = key;
      }
      items.push({ type: 'task', id: task._id, task });
    }
    return items;
  }, [datedTasks]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2">
        <span className="text-base font-bold text-gray-900 dark:text-white">
          {visibleDate.format(mode === 'agenda' ? 'MMMM YYYY' : 'MMMM YYYY')}
        </span>
        <div className="flex flex-row items-center gap-4">
          {mode !== 'agenda' ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
              >
                <Icon name="chevron-back" size={20} color="#64748b" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
              >
                <Icon name="chevron-forward" size={20} color="#64748b" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={goToToday}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
          >
            <span className="text-sm font-semibold text-primary-600">Today</span>
          </button>
        </div>
      </div>

      <div className="mx-4 mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900" role="tablist" aria-label="Calendar view mode">
        {CALENDAR_MODES.map((m) => (
          <button
            type="button"
            key={m.key}
            onClick={() => setMode(m.key)}
            role="tab"
            aria-selected={mode === m.key}
            className={`flex-1 rounded-lg py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${mode === m.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <span className={`text-xs font-semibold ${mode === m.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {mode === 'agenda' ? (
        agendaItems.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Nothing scheduled" description="Dated tasks will show up here." />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {agendaItems.map((item) =>
              item.type === 'header' ? (
                <p key={item.id} className="mb-2 mt-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {item.label}
                </p>
              ) : (
                <TaskListItem
                  key={item.id}
                  task={item.task}
                  onPress={handlePress}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onLongPressSelect={handleLongPressSelect}
                  isSelectionMode={isSelectionMode}
                  isSelected={false}
                />
              )
            )}
          </div>
        )
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div key={visibleDate.format('YYYY-MM')} className="animate-fade-in px-3">
            <div className="flex flex-row px-1">
              {WEEKDAY_LABELS.map((label, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">{label}</span>
                </div>
              ))}
            </div>
            {Array.from({ length: gridDays.length / 7 }, (_, weekIndex) => (
              <div key={weekIndex} className="flex flex-row" style={{ height: mode === 'week' ? WEEK_ROW_HEIGHT : MONTH_ROW_HEIGHT }}>
                {gridDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => (
                  <DayCell
                    key={date.format('YYYY-MM-DD')}
                    date={date}
                    isCurrentMonth={mode === 'week' || isSameMonth(date, visibleDate)}
                    isSelected={isSameDay(date, selectedDate)}
                    isToday={isSameDay(date, dayjs())}
                    dayTasks={byDay.get(dayKey(date)) ?? []}
                    compact={mode === 'week'}
                    onPress={(d) => {
                      selectionAsync();
                      setSelectedDate(d);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-gray-100 dark:border-gray-800">
            <p className="px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {selectedDate.format('dddd, MMMM D')}
            </p>
            {selectedDayTasks.length === 0 ? (
              <EmptyState icon="checkmark-done-circle-outline" title="Nothing due" description="No tasks scheduled for this day." />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto pb-4 pt-1">
                {selectedDayTasks.map((item) => (
                  <TaskListItem
                    key={item._id}
                    task={item}
                    onPress={handlePress}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onLongPressSelect={handleLongPressSelect}
                    isSelectionMode={isSelectionMode}
                    isSelected={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
