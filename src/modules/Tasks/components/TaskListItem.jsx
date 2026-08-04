import { memo } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { PRIORITY } from '../constants/taskConstants';
import { formatDueDate, isOverdue } from '../utils/dateFormat';

function MetaChip({ icon, label, color = '#94a3b8', bold = false }) {
  return (
    <span className="flex flex-row items-center">
      <Icon name={icon} size={12} color={color} />
      <span className={`ml-1 text-xs ${bold ? 'font-semibold' : ''}`} style={{ color }}>
        {label}
      </span>
    </span>
  );
}

// Web replacement for the mobile card's Swipeable (swipe-right-to-complete,
// swipe-left-to-delete): those two actions now live as icon buttons at the
// trailing edge that fade in on hover (`group-hover`), and are always shown
// on small/touch viewports where hover doesn't exist. `dragHandleProps` is
// the dnd-kit equivalent of react-native-draggable-flatlist's `drag`/
// `isActive` render-prop pair — see SortableTaskList.
//
// Wrapped in React.memo: every view that renders a list of these
// (List/Board/Matrix/Calendar) passes a `task` object whose reference stays
// stable across unrelated re-renders (TanStack Query's cache only mints a
// new object for tasks that actually changed) and callback props that are
// already `useCallback`-wrapped in useTaskActions/the view itself — so a
// re-render of the parent view (e.g. from an unrelated filter change) no
// longer re-renders every row, only the ones whose data changed.
export const TaskListItem = memo(function TaskListItem({
  task,
  onPress,
  onToggleComplete,
  onDelete,
  onLongPressSelect,
  isSelectionMode,
  isSelected,
  dragHandleProps,
  isActive,
  swipeEnabled = true,
}) {
  const isCompleted = task.status === 'completed';
  const overdue = !isCompleted && isOverdue(task.dueDate);
  const dueLabel = formatDueDate(task.dueDate);
  const priority = PRIORITY[task.priority];
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length ?? 0;
  const accentColor = task.color ?? (task.priority !== 'medium' ? priority.color : null);

  const hasMetaRow =
    dueLabel || task.subtasks?.length > 0 || task.tags?.length > 0 || task.estimatedMinutes || task.reminders?.length > 0;

  return (
    <div className="group relative mx-4 mb-2.5">
      <div
        className={`flex flex-row items-start rounded-2xl border px-3.5 py-3.5 shadow-sm ${
          isSelected
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
            : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
        } ${isActive ? 'opacity-70' : ''}`}
        style={accentColor && !isSelected ? { borderLeftWidth: 3, borderLeftColor: accentColor } : undefined}
      >
        {isSelectionMode ? (
          <button
            type="button"
            onClick={() => onLongPressSelect(task)}
            aria-label={isSelected ? 'Deselect task' : 'Select task'}
            className="mr-3 mt-0.5 h-6 w-6 flex items-center justify-center rounded-full border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            style={{ borderColor: '#2563eb', backgroundColor: isSelected ? '#2563eb' : 'transparent' }}
          >
            {isSelected ? <Icon name="checkmark" size={14} color="#fff" /> : null}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleComplete(task)}
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
            className="mr-3 mt-0.5 h-6 w-6 flex items-center justify-center rounded-full border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            style={{ borderColor: isCompleted ? '#22c55e' : priority.color, backgroundColor: isCompleted ? '#22c55e' : 'transparent' }}
          >
            {isCompleted ? <Icon name="checkmark" size={14} color="#fff" /> : null}
          </button>
        )}

        <button
          type="button"
          onClick={() => onPress(task)}
          onContextMenu={(e) => {
            e.preventDefault();
            onLongPressSelect(task);
          }}
          disabled={isActive}
          aria-label={task.title}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 rounded-lg"
        >
          <div className="flex flex-row items-center">
            {task.emoji ? <span className="mr-1.5 text-base">{task.emoji}</span> : null}
            <span
              className={`flex-1 truncate text-[15px] font-semibold ${
                isCompleted ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title}
            </span>
            {task.isFlagged ? <Icon name="flag" size={14} color="#f59e0b" style={{ marginLeft: 6 }} /> : null}
            {task.recurrence ? <Icon name="repeat" size={14} color="#94a3b8" style={{ marginLeft: 6 }} /> : null}
          </div>

          {task.description && !isCompleted ? (
            <p className="mt-0.5 truncate text-[13px] text-gray-500 dark:text-gray-400">{task.description}</p>
          ) : null}

          {hasMetaRow ? (
            <div className="mt-1.5 flex flex-row flex-wrap items-center gap-x-3 gap-y-1">
              {dueLabel ? <MetaChip icon="time-outline" label={dueLabel} color={overdue ? '#ef4444' : '#94a3b8'} bold={overdue} /> : null}
              {task.reminders?.some((r) => r.status === 'scheduled' || r.status === 'pending_ack') ? (
                <Icon name="notifications-outline" size={12} color="#94a3b8" />
              ) : null}
              {task.estimatedMinutes ? <MetaChip icon="hourglass-outline" label={`${task.estimatedMinutes}m`} /> : null}
              {task.subtasks?.length > 0 ? (
                <MetaChip icon="checkbox-outline" label={`${completedSubtasks}/${task.subtasks.length}`} />
              ) : null}
              {task.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </button>

        {swipeEnabled && !isSelectionMode ? (
          <div className="ml-2 flex flex-row items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100">
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              aria-label={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <Icon name="checkmark" size={14} color="#22c55e" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label="Delete task"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <Icon name="trash" size={14} color="#ef4444" />
            </button>
          </div>
        ) : null}

        {/* Primary accessible trigger for "select this task" / Board+Matrix's
            "move to another column/quadrant" — the row's onContextMenu above
            does the same thing, but a right-click has no keyboard or
            touch-screen-reader equivalent, so it can only ever be a bonus
            shortcut, never the only way in. Always visible (not hover-gated
            like the swipe actions) so keyboard and touch users can reach it. */}
        {!isSelectionMode ? (
          <button
            type="button"
            onClick={() => onLongPressSelect(task)}
            aria-label="More options"
            className="ml-1 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:hover:bg-gray-800"
          >
            <Icon name="ellipsis-horizontal" size={16} color="#94a3b8" />
          </button>
        ) : null}

        {dragHandleProps ? (
          <button
            type="button"
            {...dragHandleProps}
            aria-label="Drag to reorder"
            disabled={isSelectionMode}
            className="ml-2 mt-0.5 cursor-grab touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <Icon name="reorder-two-outline" size={18} color="#cbd5e1" />
          </button>
        ) : null}
      </div>
    </div>
  );
});
