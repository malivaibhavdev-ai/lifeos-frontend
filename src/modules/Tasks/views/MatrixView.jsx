import { useCallback, useMemo, useState } from 'react';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { impactAsync, ImpactFeedbackStyle } from '../../../services/haptics';
import { TaskListItem } from '../components/TaskListItem';
import { SortableTaskList } from '../components/SortableTaskList';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MATRIX_QUADRANTS, getMoveToQuadrantUpdate, resolveQuadrant } from '../utils/matrixQuadrants';
import { useReorderTasks, useTaskList, useUpdateTask } from '../hooks/useTasks';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskQueryParams } from '../hooks/useTaskQueryParams';

function MoveToSheet({ task, onClose, onMove }) {
  if (!task) return null;
  const currentQuadrant = resolveQuadrant(task);

  return (
    <Modal visible={Boolean(task)} onClose={onClose} title={`Move "${task.title}"`}>
      {MATRIX_QUADRANTS.filter((q) => q.key !== currentQuadrant).map((quadrant) => (
        <button
          type="button"
          key={quadrant.key}
          onClick={() => {
            onMove(quadrant.key);
            onClose();
          }}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-gray-800"
        >
          <Icon name={quadrant.icon} size={18} color={quadrant.color} />
          <span className="ml-3 text-base text-gray-900 dark:text-white">{quadrant.label}</span>
        </button>
      ))}
    </Modal>
  );
}

function Quadrant({ quadrant, tasks, onCardPress, onToggleComplete, onCardLongPress, onDragEnd }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border border-gray-100 dark:border-gray-800">
      <div className="flex flex-row items-center justify-between px-3 py-2" style={{ backgroundColor: `${quadrant.color}14` }}>
        <div className="flex flex-row items-center">
          <Icon name={quadrant.icon} size={13} color={quadrant.color} />
          <span className="ml-1.5 text-xs font-semibold" style={{ color: quadrant.color }}>
            {quadrant.label}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-xs text-gray-400 dark:text-gray-600">Empty</span>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SortableTaskList
            items={tasks}
            onReorder={onDragEnd}
            className="py-1.5"
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
        </div>
      )}
    </div>
  );
}

export function MatrixView() {
  const [moveTarget, setMoveTarget] = useState(null);

  const params = useTaskQueryParams({ view: 'all', sort: 'order', limit: 200, status: 'pending' });
  const { data, isLoading } = useTaskList(params);
  const reorderTasks = useReorderTasks();
  const updateTask = useUpdateTask();
  const { handlePress, handleToggleComplete } = useTaskActions();

  const tasks = data?.items ?? EMPTY_ARRAY;

  const grouped = useMemo(() => {
    const result = Object.fromEntries(MATRIX_QUADRANTS.map((q) => [q.key, []]));
    for (const task of tasks) {
      result[resolveQuadrant(task)].push(task);
    }
    return result;
  }, [tasks]);

  // Stable across renders so TaskListItem's React.memo bails out instead of
  // re-rendering every card whenever MatrixView re-renders for an unrelated
  // reason (e.g. the move-to sheet opening/closing).
  const handleCardLongPress = useCallback((task) => {
    impactAsync(ImpactFeedbackStyle.Medium);
    setMoveTarget(task);
  }, []);

  const handleDragEnd = useCallback(
    (reordered) => reorderTasks.mutate(reordered.map((t, index) => ({ id: t._id, order: index }))),
    [reorderTasks]
  );

  if (!isLoading && tasks.length === 0) {
    return (
      <EmptyState
        icon="grid-outline"
        title="Nothing to prioritize"
        description="Active tasks show up here sorted by importance and urgency."
      />
    );
  }

  const renderQuadrant = (quadrant) => (
    <Quadrant
      key={quadrant.key}
      quadrant={quadrant}
      tasks={grouped[quadrant.key]}
      onCardPress={handlePress}
      onToggleComplete={handleToggleComplete}
      onCardLongPress={handleCardLongPress}
      onDragEnd={handleDragEnd}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-row">
        {renderQuadrant(MATRIX_QUADRANTS[0])}
        {renderQuadrant(MATRIX_QUADRANTS[1])}
      </div>
      <div className="flex min-h-0 flex-1 flex-row">
        {renderQuadrant(MATRIX_QUADRANTS[2])}
        {renderQuadrant(MATRIX_QUADRANTS[3])}
      </div>

      <MoveToSheet
        task={moveTarget}
        onClose={() => setMoveTarget(null)}
        onMove={(quadrantKey) => {
          const payload = getMoveToQuadrantUpdate(quadrantKey);
          if (payload && moveTarget) updateTask.mutate({ id: moveTarget._id, payload });
        }}
      />
    </div>
  );
}
