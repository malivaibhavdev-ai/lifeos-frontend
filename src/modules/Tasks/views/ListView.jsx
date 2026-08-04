import { TaskListItem } from '../components/TaskListItem';
import { SortableTaskList } from '../components/SortableTaskList';
import { EmptyState } from '../../../components/ui/EmptyState';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useReorderTasks, useTaskList } from '../hooks/useTasks';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskQueryParams } from '../hooks/useTaskQueryParams';
import { useTaskUiStore } from '../store/taskUiStore';
import { focusQuickAdd } from '../utils/quickAddFocusRegistry';

// The original Phase 1 flat list, now just one entry in the view registry.
// Manual drag-to-reorder only makes sense when sorted by 'order' — any
// other sort disables the drag handle rather than silently reordering
// something the user didn't ask to reorder.
export function ListView() {
  const sortKey = useTaskUiStore((s) => s.sortKey);
  const searchQuery = useTaskUiStore((s) => s.searchQuery);
  const selectedIds = useTaskUiStore((s) => s.selectedIds);

  const params = useTaskQueryParams();
  const { data, isLoading } = useTaskList(params);
  const reorderTasks = useReorderTasks();
  const { isSelectionMode, handlePress, handleToggleComplete, handleDelete, handleLongPressSelect } = useTaskActions();

  const tasks = data?.items ?? EMPTY_ARRAY;
  const canManuallyReorder = sortKey === 'order';
  const isEmpty = !isLoading && tasks.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={searchQuery ? 'search-outline' : 'checkmark-done-circle-outline'}
        title={searchQuery ? 'No matching tasks' : 'Nothing here'}
        description={searchQuery ? 'Try a different search term.' : "You're all caught up in this list."}
        ctaLabel={searchQuery ? undefined : 'Add a task'}
        onCtaPress={searchQuery ? undefined : focusQuickAdd}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pt-2">
      <SortableTaskList
        items={tasks}
        disabled={!canManuallyReorder}
        onReorder={(reordered) => reorderTasks.mutate(reordered.map((t, index) => ({ id: t._id, order: index })))}
        renderItem={(item, { dragHandleProps, isDragging }) => (
          <TaskListItem
            task={item}
            onPress={handlePress}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onLongPressSelect={handleLongPressSelect}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.includes(item._id)}
            dragHandleProps={canManuallyReorder ? dragHandleProps : undefined}
            isActive={isDragging}
          />
        )}
      />
    </div>
  );
}
