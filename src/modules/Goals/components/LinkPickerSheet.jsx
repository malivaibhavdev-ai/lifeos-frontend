import { useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { useTaskList } from '../../Tasks/hooks/useTasks';
import { useHabitList } from '../../Habits/hooks/useHabits';
import { useCreateGoalLink, useDeleteGoalLink, useLinksForOwner } from '../hooks/useGoalLinks';

const TABS = [
  { key: 'task', label: 'Tasks', icon: 'checkbox-outline' },
  { key: 'habit', label: 'Habits', icon: 'repeat-outline' },
];

function Spinner({ size = 20 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
      style={{ width: size, height: size }}
    />
  );
}

// Links a Task or Habit to a Goal/Project/Milestone via the polymorphic
// GoalLink join — these are the two entity types whose completion state
// actually feeds progress computation (task_based/habit_based/mixed modes).
export function LinkPickerSheet({ visible, onClose, ownerType, ownerId }) {
  const [tab, setTab] = useState('task');

  const { data: existingLinks } = useLinksForOwner(ownerType, ownerId);
  const linkedIds = useMemo(
    () => new Set((existingLinks ?? []).filter((l) => l.linkedType === tab).map((l) => l.linkedId)),
    [existingLinks, tab]
  );

  const { data: taskData, isLoading: tasksLoading } = useTaskList({ status: 'pending' });
  const { data: habitData, isLoading: habitsLoading } = useHabitList({ includeArchived: false });

  const tasks = taskData?.items ?? [];
  const habits = habitData ?? [];
  const items = tab === 'task' ? tasks : habits;
  const isLoading = tab === 'task' ? tasksLoading : habitsLoading;

  const createLink = useCreateGoalLink();
  const deleteLink = useDeleteGoalLink();

  const toggle = (linkedId) => {
    if (linkedIds.has(linkedId)) {
      deleteLink.mutate({ ownerType, ownerId, linkedType: tab, linkedId });
    } else {
      createLink.mutate({ ownerType, ownerId, linkedType: tab, linkedId });
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Link items">
      <div className="mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 flex-row items-center justify-center rounded-lg py-2 ${tab === t.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <Icon name={t.icon} size={14} color={tab === t.key ? '#2563eb' : '#94a3b8'} />
            <span className={`ml-1.5 text-xs font-semibold ${tab === t.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            No {tab === 'task' ? 'open tasks' : 'habits'} to link.
          </p>
        ) : (
          items.map((item) => {
            const isLinked = linkedIds.has(item._id);
            return (
              <button
                type="button"
                key={item._id}
                onClick={() => toggle(item._id)}
                className="flex w-full flex-row items-center border-b border-gray-100 py-3 text-left dark:border-gray-800"
              >
                <Icon
                  name={isLinked ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isLinked ? '#2563eb' : '#cbd5e1'}
                />
                <span className="ml-3 flex-1 truncate text-sm text-gray-900 dark:text-white">
                  {tab === 'task' ? item.title : item.name}
                </span>
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
