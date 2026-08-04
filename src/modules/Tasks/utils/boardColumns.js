export const BOARD_COLUMNS = [
  { key: 'inbox', label: 'Inbox', icon: 'file-tray-outline', color: '#64748b' },
  { key: 'pending', label: 'Pending', icon: 'ellipse-outline', color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress', icon: 'sync-outline', color: '#f59e0b' },
  { key: 'waiting', label: 'Waiting', icon: 'pause-circle-outline', color: '#8b5cf6' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle-outline', color: '#22c55e' },
  { key: 'archived', label: 'Archived', icon: 'archive-outline', color: '#94a3b8' },
];

// A task's board column is derived entirely from its existing
// status/bucket/isArchived/dueDate fields — no new schema needed, and any
// other view (List/Matrix/Calendar) stays the single source of truth for
// what those fields mean. Inbox vs Pending both use bucket='inbox' and are
// told apart the same way the smart lists already do it: undated = Inbox,
// dated = Pending. That means an undated task "moved" to Pending via the
// board still reads as Inbox until it's given a due date — a deliberate,
// documented simplification rather than adding a bucket value that exists
// only for board grouping.
export function resolveBoardColumn(task) {
  if (task.isArchived) return 'archived';
  if (task.status === 'completed' || task.status === 'cancelled') return 'completed';
  if (task.status === 'in_progress') return 'in_progress';
  if (task.bucket === 'waiting') return 'waiting';
  if (task.bucket === 'inbox' && !task.dueDate) return 'inbox';
  return 'pending';
}

// Describes the mutation a "move to column" action should perform, without
// this module knowing anything about React Query — BoardView translates the
// `kind` into whichever mutation hook applies. Kept as a pure function so
// the column-assignment logic is unit-testable independent of the UI.
export function getMoveToColumnUpdate(targetColumn, task) {
  switch (targetColumn) {
    case 'inbox':
      return { kind: 'update', payload: { bucket: 'inbox', dueDate: null, status: 'pending' } };
    case 'pending':
      return { kind: 'update', payload: { bucket: task.dueDate ? task.bucket : 'inbox', status: 'pending' } };
    case 'in_progress':
      return { kind: 'status', status: 'in_progress' };
    case 'waiting':
      return { kind: 'update', payload: { bucket: 'waiting' } };
    case 'completed':
      return { kind: 'status', status: 'completed' };
    case 'archived':
      return { kind: 'archive' };
    default:
      return null;
  }
}
