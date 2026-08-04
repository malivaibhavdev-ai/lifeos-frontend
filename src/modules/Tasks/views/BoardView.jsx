import { useCallback, useMemo, useState } from 'react';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { impactAsync, ImpactFeedbackStyle } from '../../../services/haptics';
import { TaskListItem } from '../components/TaskListItem';
import { SortableTaskList } from '../components/SortableTaskList';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BOARD_COLUMNS, getMoveToColumnUpdate, resolveBoardColumn } from '../utils/boardColumns';
import { useArchiveTask, useMarkTaskStatus, useReorderTasks, useTaskList, useUpdateTask } from '../hooks/useTasks';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskQueryParams } from '../hooks/useTaskQueryParams';

// Fixed 280px on mobile/tablet-width viewports (unchanged from the original
// port); on desktop-wide viewports each column gets more breathing room
// instead of the board just horizontal-scrolling harder — see the
// COLUMN_WIDTH_CLASS usage below.
const COLUMN_WIDTH_CLASS = 'w-[280px] lg:w-[320px] xl:w-[360px]';

// Cross-column dragging is deliberately not implemented yet (see the
// Phase 3 architecture note) — moving a card between columns goes through
// getMoveToColumnUpdate, dispatched here to whichever mutation applies.
// When live drag-across-columns is built later, it plugs into this exact
// same dispatch function; only the gesture layer changes.
function dispatchColumnMove(task, targetColumn, { updateTask, markStatus, archiveTask }) {
  const update = getMoveToColumnUpdate(targetColumn, task);
  if (!update) return;

  if (task.isArchived && targetColumn !== 'archived') {
    // Leaving Archived always needs an explicit unarchive first, on top of
    // whatever the target column itself requires.
    updateTask.mutate({ id: task._id, payload: { isArchived: false, archivedAt: null } });
  }

  if (update.kind === 'update') {
    updateTask.mutate({ id: task._id, payload: update.payload });
  } else if (update.kind === 'status') {
    markStatus.mutate({ id: task._id, status: update.status });
  } else if (update.kind === 'archive') {
    archiveTask.mutate(task._id);
  }
}

function MoveToSheet({ task, onClose, onMove }) {
  if (!task) return null;
  const currentColumn = resolveBoardColumn(task);

  return (
    <Modal visible={Boolean(task)} onClose={onClose} title={`Move "${task.title}"`}>
      {BOARD_COLUMNS.filter((c) => c.key !== currentColumn).map((column) => (
        <button
          type="button"
          key={column.key}
          onClick={() => {
            onMove(column.key);
            onClose();
          }}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-gray-800"
        >
          <Icon name={column.icon} size={18} color={column.color} />
          <span className="ml-3 text-base text-gray-900 dark:text-white">{column.label}</span>
        </button>
      ))}
    </Modal>
  );
}

function BoardColumn({ column, tasks, onCardPress, onToggleComplete, onCardLongPress, onDragEnd }) {
  return (
    <div
      className={`mr-3 lg:mr-4 flex-shrink-0 rounded-2xl bg-gray-50 dark:bg-gray-900/60 ${COLUMN_WIDTH_CLASS}`}
      style={{ maxHeight: '100%' }}
    >
      <div className="flex flex-row items-center justify-between px-3 pt-3 pb-2">
        <div className="flex flex-row items-center">
          <Icon name={column.icon} size={15} color={column.color} />
          <span className="ml-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{column.label}</span>
        </div>
        <div className="rounded-full bg-gray-200 px-2 py-0.5 dark:bg-gray-700">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{tasks.length}</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-xs text-gray-400 dark:text-gray-600">No tasks</span>
        </div>
      ) : (
        <SortableTaskList
          items={tasks}
          onReorder={(reordered) => onDragEnd(reordered)}
          className="pb-3"
          renderItem={(item, { dragHandleProps, isDragging }) => (
            <TaskListItem
              task={item}
              onPress={onCardPress}
              onToggleComplete={onToggleComplete}
              onLongPressSelect={onCardLongPress}
              isSelectionMode={false}
              isSelected={false}
              dragHandleProps={dragHandleProps}
              isActive={isDragging}
              swipeEnabled={false}
            />
          )}
        />
      )}
    </div>
  );
}

export function BoardView() {
  const [moveTarget, setMoveTarget] = useState(null);

  const params = useTaskQueryParams({ view: 'all', sort: 'order', limit: 200 });
  const { data, isLoading } = useTaskList(params);
  const reorderTasks = useReorderTasks();
  const updateTask = useUpdateTask();
  const markStatus = useMarkTaskStatus();
  const archiveTask = useArchiveTask();
  const { handlePress, handleToggleComplete } = useTaskActions();

  const tasks = data?.items ?? EMPTY_ARRAY;

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(BOARD_COLUMNS.map((c) => [c.key, []]));
    for (const task of tasks) {
      grouped[resolveBoardColumn(task)].push(task);
    }
    return grouped;
  }, [tasks]);

  // Stable across renders so TaskListItem's React.memo actually bails out
  // instead of re-rendering every card whenever BoardView re-renders for an
  // unrelated reason (e.g. the move-to sheet opening/closing).
  const handleCardLongPress = useCallback((task) => {
    impactAsync(ImpactFeedbackStyle.Medium);
    setMoveTarget(task);
  }, []);

  const handleDragEnd = useCallback(
    (reordered) => reorderTasks.mutate(reordered.map((t, index) => ({ id: t._id, order: index }))),
    [reorderTasks]
  );

  if (!isLoading && tasks.length === 0) {
    return <EmptyState icon="albums-outline" title="Board is empty" description="Add a task to see it appear here." />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-row overflow-x-auto p-3 lg:p-4">
        {BOARD_COLUMNS.map((column) => (
          <BoardColumn
            key={column.key}
            column={column}
            tasks={columns[column.key]}
            onCardPress={handlePress}
            onToggleComplete={handleToggleComplete}
            onCardLongPress={handleCardLongPress}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <MoveToSheet
        task={moveTarget}
        onClose={() => setMoveTarget(null)}
        onMove={(targetColumn) => dispatchColumnMove(moveTarget, targetColumn, { updateTask, markStatus, archiveTask })}
      />
    </div>
  );
}
