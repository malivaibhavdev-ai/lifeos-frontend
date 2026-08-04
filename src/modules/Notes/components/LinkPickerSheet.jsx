import { useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { useNoteList } from '../hooks/useNotes';
import { useTaskList } from '../../Tasks/hooks/useTasks';
import { useHabitList } from '../../Habits/hooks/useHabits';
import { useGoalList } from '../../Goals/hooks/useGoals';
import { useCreateKnowledgeLink, useDeleteKnowledgeLink, useLinksForOwner } from '../hooks/useKnowledgeLinks';

const TABS = [
  { key: 'note', label: 'Notes', icon: 'document-text-outline' },
  { key: 'task', label: 'Tasks', icon: 'checkbox-outline' },
  { key: 'habit', label: 'Habits', icon: 'repeat-outline' },
  { key: 'goal', label: 'Goals', icon: 'flag-outline' },
];

// Links a Note or Daily Note to another Note (the knowledge graph) or to a
// Task/Habit/Goal (cross-module reference) via KnowledgeLink. Project/
// Milestone/CalendarEvent are supported by the same backend endpoint but
// not surfaced in this picker yet — Note/Task/Habit/Goal cover the primary
// "connect my thinking to my plans" use case for this phase.
export function LinkPickerSheet({ visible, onClose, ownerType, ownerId, excludeNoteId }) {
  const [tab, setTab] = useState('note');

  const { data: existingLinks } = useLinksForOwner(ownerType, ownerId);
  const linkedIds = useMemo(
    () => new Set((existingLinks ?? []).filter((l) => l.linkedType === tab).map((l) => String(l.linkedId))),
    [existingLinks, tab]
  );

  const { data: noteData, isLoading: notesLoading } = useNoteList({ view: 'active' });
  const { data: taskData, isLoading: tasksLoading } = useTaskList({ status: 'pending' });
  const { data: habitData, isLoading: habitsLoading } = useHabitList({ includeArchived: false });
  const { data: goalData, isLoading: goalsLoading } = useGoalList({ includeArchived: false });

  const notes = (noteData?.items ?? []).filter((n) => n._id !== excludeNoteId);
  const tasks = taskData?.items ?? [];
  const habits = habitData ?? [];
  const goals = goalData ?? [];

  const itemsByTab = { note: notes, task: tasks, habit: habits, goal: goals };
  const loadingByTab = { note: notesLoading, task: tasksLoading, habit: habitsLoading, goal: goalsLoading };
  const items = itemsByTab[tab];
  const isLoading = loadingByTab[tab];

  const createLink = useCreateKnowledgeLink();
  const deleteLink = useDeleteKnowledgeLink();

  const toggle = (linkedId) => {
    if (linkedIds.has(String(linkedId))) {
      deleteLink.mutate({ ownerType, ownerId, linkedType: tab, linkedId });
    } else {
      createLink.mutate({ ownerType, ownerId, linkedType: tab, linkedId });
    }
  };

  const labelFor = (item) => item.title || item.name;

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
            <Icon name={t.icon} size={13} color={tab === t.key ? '#2563eb' : '#94a3b8'} />
            <span className={`ml-1 text-xs font-semibold ${tab === t.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
        {isLoading ? (
          <div className="my-6 flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Nothing to link here yet.</p>
        ) : (
          items.map((item) => {
            const isLinked = linkedIds.has(String(item._id));
            return (
              <button
                type="button"
                key={item._id}
                onClick={() => toggle(item._id)}
                className="flex w-full flex-row items-center border-b border-gray-100 py-3 text-left dark:border-gray-800"
              >
                <Icon name={isLinked ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={isLinked ? '#2563eb' : '#cbd5e1'} />
                <span className="ml-3 flex-1 truncate text-sm text-gray-900 dark:text-white">{labelFor(item)}</span>
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
