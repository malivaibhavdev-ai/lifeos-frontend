export const PRIORITY = {
  low: { key: 'low', label: 'Low', color: '#64748b', weight: 1 },
  medium: { key: 'medium', label: 'Medium', color: '#3b82f6', weight: 2 },
  high: { key: 'high', label: 'High', color: '#f59e0b', weight: 3 },
  urgent: { key: 'urgent', label: 'Urgent', color: '#ef4444', weight: 4 },
};
export const PRIORITY_ORDER = ['low', 'medium', 'high', 'urgent'];

export const ENERGY_LEVEL = {
  low: { key: 'low', label: 'Low energy', icon: 'battery-dead-outline' },
  medium: { key: 'medium', label: 'Medium energy', icon: 'battery-half-outline' },
  high: { key: 'high', label: 'High energy', icon: 'battery-full-outline' },
};

export const STATUS = {
  pending: { key: 'pending', label: 'Pending' },
  in_progress: { key: 'in_progress', label: 'In Progress' },
  completed: { key: 'completed', label: 'Completed' },
  cancelled: { key: 'cancelled', label: 'Cancelled' },
};

export const BUCKET = {
  inbox: { key: 'inbox', label: 'Inbox' },
  someday: { key: 'someday', label: 'Someday' },
  waiting: { key: 'waiting', label: 'Waiting' },
  delegated: { key: 'delegated', label: 'Delegated' },
};

// Smart lists shown as the primary segmented control on the Task list screen.
// `view` maps 1:1 to the backend's `?view=` query param.
export const SMART_LISTS = [
  { key: 'today', view: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'upcoming', view: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'overdue', view: 'overdue', label: 'Overdue', icon: 'alert-circle-outline' },
  { key: 'inbox', view: 'inbox', label: 'Inbox', icon: 'file-tray-outline' },
  { key: 'flagged', view: 'flagged', label: 'Flagged', icon: 'flag-outline' },
  { key: 'highPriority', view: 'highPriority', label: 'High Priority', icon: 'flame-outline' },
  { key: 'someday', view: 'someday', label: 'Someday', icon: 'hourglass-outline' },
  { key: 'waiting', view: 'waiting', label: 'Waiting', icon: 'pause-circle-outline' },
  { key: 'delegated', view: 'delegated', label: 'Delegated', icon: 'people-outline' },
  { key: 'completed', view: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
  { key: 'all', view: 'all', label: 'All Tasks', icon: 'list-outline' },
];

export const SORT_OPTIONS = [
  { key: 'order', label: 'Manual order' },
  { key: 'dueDate', label: 'Due date' },
  { key: 'priority', label: 'Priority' },
  { key: 'importance', label: 'Importance' },
  { key: 'urgency', label: 'Urgency' },
  { key: 'createdAt', label: 'Date created' },
  { key: 'updatedAt', label: 'Last updated' },
  { key: 'title', label: 'Alphabetical' },
  { key: 'estimatedMinutes', label: 'Estimated time' },
];

export const RECURRENCE_PRESETS = [
  { key: 'none', label: 'Does not repeat', recurrence: null },
  { key: 'daily', label: 'Daily', recurrence: { freq: 'DAILY', interval: 1 } },
  { key: 'weekdays', label: 'Every weekday', recurrence: { freq: 'WEEKLY', interval: 1, byweekday: ['MO', 'TU', 'WE', 'TH', 'FR'] } },
  { key: 'weekly', label: 'Weekly', recurrence: { freq: 'WEEKLY', interval: 1 } },
  { key: 'monthly', label: 'Monthly', recurrence: { freq: 'MONTHLY', interval: 1 } },
  { key: 'yearly', label: 'Yearly', recurrence: { freq: 'YEARLY', interval: 1 } },
  { key: 'custom', label: 'Custom', recurrence: null },
];

export const WEEKDAYS = [
  { key: 'MO', label: 'M' },
  { key: 'TU', label: 'T' },
  { key: 'WE', label: 'W' },
  { key: 'TH', label: 'T' },
  { key: 'FR', label: 'F' },
  { key: 'SA', label: 'S' },
  { key: 'SU', label: 'S' },
];

export const REMINDER_PRESETS = [
  { key: 'at_due', label: 'At due time', offsetMinutes: 0 },
  { key: '5min', label: '5 minutes before', offsetMinutes: 5 },
  { key: '15min', label: '15 minutes before', offsetMinutes: 15 },
  { key: '30min', label: '30 minutes before', offsetMinutes: 30 },
  { key: '1hour', label: '1 hour before', offsetMinutes: 60 },
  { key: '1day', label: '1 day before', offsetMinutes: 60 * 24 },
];

export const TASK_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];
