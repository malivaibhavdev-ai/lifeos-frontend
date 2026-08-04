import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskUiStore } from '../store/taskUiStore';
import { useDeleteTask, useMarkTaskStatus } from './useTasks';

// Shared card-interaction handlers — every view that renders TaskListItem
// (List, Board, Matrix, ...) uses this instead of reimplementing
// press/complete/delete/select behavior itself. Selection-mode state lives
// in the shared taskUiStore, so it's consistent no matter which view
// triggered it.
export function useTaskActions() {
  const navigate = useNavigate();
  const isSelectionMode = useTaskUiStore((s) => s.isSelectionMode);
  const toggleSelected = useTaskUiStore((s) => s.toggleSelected);
  const enterSelectionMode = useTaskUiStore((s) => s.enterSelectionMode);

  const markStatus = useMarkTaskStatus();
  const deleteTask = useDeleteTask();

  const handleToggleComplete = useCallback(
    (task) => {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      markStatus.mutate({ id: task._id, status: nextStatus });
    },
    [markStatus]
  );

  const handleDelete = useCallback((task) => deleteTask.mutate(task._id), [deleteTask]);

  const handlePress = useCallback(
    (task) => {
      if (isSelectionMode) {
        toggleSelected(task._id);
        return;
      }
      navigate(`/tasks/${task._id}`);
    },
    [isSelectionMode, toggleSelected, navigate]
  );

  const handleLongPressSelect = useCallback(
    (task) => {
      if (!isSelectionMode) enterSelectionMode(task._id);
    },
    [isSelectionMode, enterSelectionMode]
  );

  return { isSelectionMode, handlePress, handleToggleComplete, handleDelete, handleLongPressSelect };
}
