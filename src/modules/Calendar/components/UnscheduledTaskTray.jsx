import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Icon } from '../../../components/ui/Icon';
import { useTaskList } from '../../Tasks/hooks/useTasks';
import { PRIORITY } from '../../Tasks/constants/taskConstants';

const ACTIVE_STATUSES = ['pending', 'in_progress'];

// Draggable source — the DndContext that pairs this with the Day grid's
// droppable canvas lives in DayView (the parent), which is what lets a
// drag start here and end there. `isDragging` comes straight from
// useDraggable, replacing the isBeingDragged prop RN threaded down from a
// gesture-handler ref.
function TaskChip({ task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  // Not a full keyboard/drag-and-drop equivalent (that would need a
  // keyboard-operable "pick a time slot" flow on the grid side, which
  // doesn't exist yet — same deferred scope as Board's cross-column drag).
  // This chip is at least focusable and identifies itself to a screen
  // reader/keyboard user, rather than being silently unreachable.
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={`${task.title} — drag onto the calendar below to schedule`}
      className="mr-2 flex flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900 touch-none cursor-grab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      style={{ minWidth: 140, maxWidth: 200, opacity: isDragging ? 0.3 : 1 }}
    >
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY[task.priority]?.color ?? '#64748b' }} />
      <span className="line-clamp-1 ml-2 flex-1 text-sm font-medium text-gray-900 dark:text-white">
        {task.title}
      </span>
    </div>
  );
}

// Drag any chip onto the Day grid to time-block it (press-and-hold to
// disambiguate from horizontally scrolling the tray beneath it — see
// DayView's PointerSensor activationConstraint). Tasks already scheduled
// for the day being viewed (`excludeTaskIds`) drop out of the tray so it
// always reads as "what's still unplanned for today."
export function UnscheduledTaskTray({ excludeTaskIds }) {
  const { data } = useTaskList({ sort: 'priority', sortDir: 'desc', limit: 40 });

  const tasks = useMemo(() => {
    const excludeSet = new Set(excludeTaskIds ?? []);
    return (data?.items ?? []).filter((t) => ACTIVE_STATUSES.includes(t.status) && !excludeSet.has(t._id));
  }, [data, excludeTaskIds]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-row items-center px-4 py-3">
        <Icon name="checkmark-done-outline" size={16} color="#22c55e" />
        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">Nothing left to schedule</span>
      </div>
    );
  }

  return (
    <div>
      <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Unscheduled · drag onto the grid
      </p>
      <div className="flex flex-row overflow-x-auto" style={{ paddingLeft: 16, paddingRight: 16 }}>
        {tasks.map((task) => (
          <TaskChip key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}
