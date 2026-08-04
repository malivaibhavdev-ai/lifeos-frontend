const ACTIVE_STATUSES = ['pending', 'in_progress'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Client-side mirror of the backend's applyViewFilter (task.service.js).
// Used to decide, without a round trip, whether a just-mutated task still
// belongs in a given cached smart-list query — so completing/uncompleting/
// rescheduling a task instantly removes or keeps it in whatever lists are
// on screen instead of waiting for the next invalidation refetch to correct it.
export function taskMatchesView(task, view, { now = new Date() } = {}) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isActive = ACTIVE_STATUSES.includes(task.status);

  switch (view) {
    case 'today':
      return isActive && dueDate != null && dueDate >= startOfDay(now) && dueDate <= endOfDay(now);
    case 'tomorrow': {
      const tomorrow = addDays(now, 1);
      return isActive && dueDate != null && dueDate >= startOfDay(tomorrow) && dueDate <= endOfDay(tomorrow);
    }
    case 'upcoming':
      return isActive && dueDate != null && dueDate > endOfDay(now);
    case 'overdue':
      return isActive && dueDate != null && dueDate < startOfDay(now);
    case 'inbox':
      return isActive && task.bucket === 'inbox' && dueDate == null;
    case 'someday':
      return task.bucket === 'someday';
    case 'waiting':
      return task.bucket === 'waiting';
    case 'delegated':
      return task.bucket === 'delegated';
    case 'completed':
    case 'recentCompleted':
      return task.status === 'completed';
    case 'flagged':
    case 'starred':
      return isActive && Boolean(task.isFlagged);
    case 'highPriority':
      return isActive && ['high', 'urgent'].includes(task.priority);
    case 'all':
    case 'recent':
    case undefined:
      return true;
    default:
      return true;
  }
}

// Where a freshly created task will actually be visible, in priority order —
// used to auto-switch the active smart list after quick-add so the new task
// is never created "into the void" of a view that filters it out.
const LANDING_VIEW_PRIORITY = ['today', 'tomorrow', 'upcoming', 'overdue', 'inbox'];

export function resolveLandingView(task) {
  return LANDING_VIEW_PRIORITY.find((view) => taskMatchesView(task, view)) ?? 'inbox';
}
