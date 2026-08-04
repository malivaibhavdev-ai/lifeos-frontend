import { dayKey } from '../../../utils/calendarGrid';

export { getMonthGrid, getWeekGrid, isSameDay, isSameMonth, dayKey } from '../../../utils/calendarGrid';

// Groups dated tasks by their due date (YYYY-MM-DD) — undated tasks never
// appear in a calendar-shaped view, which is expected; they belong to
// Inbox/List instead.
export function groupTasksByDay(tasks) {
  const map = new Map();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = dayKey(task.dueDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(task);
  }
  return map;
}
