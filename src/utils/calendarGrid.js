import dayjs from 'dayjs';

// Generic date-grid math shared by every calendar-shaped view in the app
// (the Calendar workspace's Month/Week/Day views, and Tasks' own Calendar
// view) — no entity-specific grouping logic lives here, that stays local to
// whichever module needs it (see modules/Tasks/utils/calendarGrid.js's
// groupTasksByDay for the task-specific example).

// Returns 42 dayjs objects (6 full weeks) covering the given month,
// including the leading/trailing days from adjacent months needed to make
// the grid a complete rectangle — weeks start on Sunday.
export function getMonthGrid(year, month) {
  const firstOfMonth = dayjs(new Date(year, month, 1));
  const startOffset = firstOfMonth.day(); // 0 (Sun) .. 6 (Sat)
  const gridStart = firstOfMonth.subtract(startOffset, 'day');

  return Array.from({ length: 42 }, (_, i) => gridStart.add(i, 'day'));
}

export function getWeekGrid(date) {
  const d = dayjs(date);
  const startOffset = d.day();
  const weekStart = d.subtract(startOffset, 'day');
  return Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
}

export function isSameDay(a, b) {
  return dayjs(a).isSame(dayjs(b), 'day');
}

export function isSameMonth(a, b) {
  return dayjs(a).isSame(dayjs(b), 'month');
}

export function dayKey(date) {
  return dayjs(date).format('YYYY-MM-DD');
}
