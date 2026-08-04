import dayjs from 'dayjs';

// Human-friendly relative label for a task due date, the way every premium
// task app renders list rows: "Today", "Tomorrow", weekday name within the
// next week, otherwise a short date. Includes the time only when the date
// carries a non-midnight time (a bare date from quick-add stays at 00:00).
export function formatDueDate(dueDate, { now = new Date() } = {}) {
  if (!dueDate) return null;

  const date = dayjs(dueDate);
  const today = dayjs(now).startOf('day');
  const diffDays = date.startOf('day').diff(today, 'day');
  const hasTime = date.hour() !== 0 || date.minute() !== 0;
  const timeSuffix = hasTime ? ` ${date.format('h:mm A')}` : '';

  if (diffDays === 0) return `Today${timeSuffix}`;
  if (diffDays === 1) return `Tomorrow${timeSuffix}`;
  if (diffDays === -1) return `Yesterday${timeSuffix}`;
  if (diffDays > 1 && diffDays < 7) return `${date.format('dddd')}${timeSuffix}`;
  if (diffDays < 0) return `${date.format('MMM D')}${timeSuffix}`;

  return `${date.format('MMM D')}${timeSuffix}`;
}

export function isOverdue(dueDate, { now = new Date() } = {}) {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs(now));
}

export function formatReminderOffset(offsetMinutes) {
  if (offsetMinutes == null) return 'Custom time';
  if (offsetMinutes === 0) return 'At due time';
  if (offsetMinutes < 60) return `${offsetMinutes} min before`;
  if (offsetMinutes < 60 * 24) {
    const hours = Math.round(offsetMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} before`;
  }
  const days = Math.round(offsetMinutes / (60 * 24));
  return `${days} day${days > 1 ? 's' : ''} before`;
}
