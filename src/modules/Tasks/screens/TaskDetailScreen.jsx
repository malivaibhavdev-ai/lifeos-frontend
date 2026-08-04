import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { Screen } from '../../../components/ui/Screen';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { PrioritySelector } from '../components/PrioritySelector';
import { DateField } from '../../../components/ui/DateField';
import { TagInput } from '../components/TagInput';
import { SubtaskList } from '../components/SubtaskList';
import { RecurrencePicker } from '../components/RecurrencePicker';
import { ReminderPicker } from '../components/ReminderPicker';
import { ColorEmojiPicker } from '../components/ColorEmojiPicker';
import { ENERGY_LEVEL } from '../constants/taskConstants';
import {
  useArchiveTask,
  useDuplicateTask,
  useDeleteTask,
  usePermanentDeleteTask,
  useRestoreTask,
  useTask,
  useUnarchiveTask,
  useUpdateTask,
} from '../hooks/useTasks';

function mapTaskToFormValues(task) {
  return {
    title: task.title,
    description: task.description ?? '',
    notes: task.notes ?? '',
    priority: task.priority,
    importance: task.importance,
    urgency: task.urgency,
    energyLevel: task.energyLevel,
    estimatedMinutes: task.estimatedMinutes != null ? String(task.estimatedMinutes) : '',
    actualMinutes: task.actualMinutes != null ? String(task.actualMinutes) : '',
    startDate: task.startDate ? new Date(task.startDate) : null,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    color: task.color,
    emoji: task.emoji,
    isPinned: task.isPinned,
    isFlagged: task.isFlagged,
    category: task.category,
    tags: task.tags ?? [],
    subtasks: task.subtasks ?? [],
    reminders: (task.reminders ?? []).map(({ _id, offsetMinutes, remindAt, status, escalation }) => ({
      _id,
      offsetMinutes,
      remindAt,
      status,
      escalation,
    })),
    recurrence: task.recurrence ?? null,
  };
}

function buildUpdatePayload(values) {
  return {
    ...values,
    estimatedMinutes: values.estimatedMinutes === '' ? null : Number(values.estimatedMinutes),
    actualMinutes: values.actualMinutes === '' ? null : Number(values.actualMinutes),
    startDate: values.startDate ? values.startDate.toISOString() : null,
    dueDate: values.dueDate ? values.dueDate.toISOString() : null,
  };
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</p>
      {children}
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
      style={{ width: size, height: size }}
    />
  );
}

export function TaskDetailScreen() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const restoreTask = useRestoreTask();
  const permanentDeleteTask = usePermanentDeleteTask();
  const duplicateTask = useDuplicateTask();
  const archiveTask = useArchiveTask();
  const unarchiveTask = useUnarchiveTask();

  const [showActions, setShowActions] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [saveError, setSaveError] = useState(null);
  const loadedTaskId = useRef(null);

  const { control, watch, reset, getValues, setValue } = useForm({
    defaultValues: { title: '', description: '', tags: [], subtasks: [], reminders: [], recurrence: null },
  });

  // Reset the form only the first time this task's data arrives, so a
  // background refetch (e.g. after a reminder fires server-side) never
  // clobbers text the user is actively typing.
  useEffect(() => {
    if (task && loadedTaskId.current !== task._id) {
      reset(mapTaskToFormValues(task));
      loadedTaskId.current = task._id;
    }
  }, [task, reset]);

  const watchedValues = watch();

  useEffect(() => {
    if (!task || loadedTaskId.current !== task._id) return;
    if (!watchedValues.title?.trim()) return;

    const timeout = setTimeout(() => {
      setSaveState('saving');
      updateTask.mutate(
        { id: task._id, payload: buildUpdatePayload(getValues()) },
        {
          onSuccess: (updatedTask) => {
            setSaveState('saved');
            setSaveError(null);
            // New subtasks/reminders are sent without an _id; sync the ones
            // the server just assigned back into the form (by array index,
            // order is preserved) so the *next* autosave updates them in
            // place instead of minting a fresh subdocument every time.
            setValue('subtasks', updatedTask.subtasks, { shouldDirty: false });
            setValue(
              'reminders',
              updatedTask.reminders.map(({ _id, offsetMinutes, remindAt, status, escalation }) => ({
                _id,
                offsetMinutes,
                remindAt,
                status,
                escalation,
              })),
              { shouldDirty: false }
            );
          },
          onError: (error) => {
            setSaveState('error');
            setSaveError(error?.message ?? 'Could not save changes');
          },
        }
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 700);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  if (isLoading || !task) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={24} />
        </div>
      </Screen>
    );
  }

  const isTrashed = Boolean(task.deletedAt);
  const dueDate = watchedValues.dueDate;

  const actions = isTrashed
    ? [
        {
          label: 'Restore task',
          icon: 'refresh-outline',
          onPress: () => {
            restoreTask.mutate(task._id);
            navigate(-1);
          },
        },
        {
          label: 'Delete permanently',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => {
            permanentDeleteTask.mutate(task._id);
            navigate(-1);
          },
        },
      ]
    : [
        { label: 'Duplicate task', icon: 'copy-outline', onPress: () => duplicateTask.mutate(task._id) },
        task.isArchived
          ? { label: 'Unarchive task', icon: 'archive-outline', onPress: () => unarchiveTask.mutate(task._id) }
          : { label: 'Archive task', icon: 'archive-outline', onPress: () => archiveTask.mutate(task._id) },
        {
          label: 'Move to trash',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => {
            deleteTask.mutate(task._id);
            navigate(-1);
          },
        },
      ];

  return (
    <Screen scroll>
      <PageContainer className="flex flex-1 flex-col">
      <div className="flex flex-row items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
        >
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <div className="flex flex-row items-center gap-5">
          <Controller
            control={control}
            name="isFlagged"
            render={({ field: { value, onChange } }) => (
              <button
                type="button"
                onClick={() => onChange(!value)}
                aria-label="Toggle flag"
                aria-pressed={Boolean(value)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
              >
                <Icon name={value ? 'flag' : 'flag-outline'} size={22} color={value ? '#f59e0b' : '#64748b'} />
              </button>
            )}
          />
          <Controller
            control={control}
            name="isPinned"
            render={({ field: { value, onChange } }) => (
              <button
                type="button"
                onClick={() => onChange(!value)}
                aria-label="Toggle pin"
                aria-pressed={Boolean(value)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
              >
                <Icon name={value ? 'bookmark' : 'bookmark-outline'} size={22} color={value ? '#2563eb' : '#64748b'} />
              </button>
            )}
          />
          <button
            type="button"
            onClick={() => setShowActions(true)}
            aria-label="Task actions"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
          >
            <Icon name="ellipsis-horizontal" size={22} color="#64748b" />
          </button>
        </div>
      </div>

      <div className="flex flex-row items-center pt-1">
        {saveState === 'saving' ? (
          <>
            <Spinner size={14} />
            <span className="ml-1.5 text-xs text-gray-400">Saving…</span>
          </>
        ) : null}
        {saveState === 'saved' ? (
          <>
            <Icon name="checkmark-circle" size={14} color="#22c55e" />
            <span className="ml-1.5 text-xs text-success">Saved</span>
          </>
        ) : null}
        {saveState === 'error' ? (
          <>
            <Icon name="alert-circle" size={14} color="#ef4444" />
            <span className="ml-1.5 text-xs text-danger">Couldn't save</span>
          </>
        ) : null}
      </div>

      <div className="pt-3">
        {saveState === 'error' ? <ErrorBanner message={saveError} /> : null}

        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange } }) => (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Task title"
              aria-label="Task title"
              rows={1}
              className="w-full resize-none bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Add a description…"
              aria-label="Description"
              rows={2}
              className="mt-2 w-full resize-none bg-transparent text-base text-gray-600 outline-none placeholder:text-gray-400 dark:text-gray-400"
            />
          )}
        />

        <Section title="Priority">
          <Controller control={control} name="priority" render={({ field: { value, onChange } }) => <PrioritySelector value={value} onChange={onChange} />} />
        </Section>

        <Section title="Eisenhower Matrix">
          <div className="flex flex-row gap-6">
            <Controller
              control={control}
              name="importance"
              render={({ field: { value, onChange } }) => (
                <button
                  type="button"
                  onClick={() => onChange(value === 'high' ? 'low' : 'high')}
                  role="checkbox"
                  aria-checked={value === 'high'}
                  className="flex flex-row items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  <Icon name={value === 'high' ? 'checkbox' : 'square-outline'} size={20} color="#2563eb" />
                  <span className="ml-2 text-base text-gray-700 dark:text-gray-300">Important</span>
                </button>
              )}
            />
            <Controller
              control={control}
              name="urgency"
              render={({ field: { value, onChange } }) => (
                <button
                  type="button"
                  onClick={() => onChange(value === 'high' ? 'low' : 'high')}
                  role="checkbox"
                  aria-checked={value === 'high'}
                  className="flex flex-row items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  <Icon name={value === 'high' ? 'checkbox' : 'square-outline'} size={20} color="#ef4444" />
                  <span className="ml-2 text-base text-gray-700 dark:text-gray-300">Urgent</span>
                </button>
              )}
            />
          </div>
        </Section>

        <Section title="Energy level">
          <div className="flex flex-row gap-2">
            <Controller
              control={control}
              name="energyLevel"
              render={({ field: { value, onChange } }) => (
                <>
                  {Object.values(ENERGY_LEVEL).map((level) => {
                    const isSelected = value === level.key;
                    return (
                      <button
                        type="button"
                        key={level.key}
                        onClick={() => onChange(isSelected ? null : level.key)}
                        aria-pressed={isSelected}
                        className={`flex flex-row items-center rounded-full border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                          isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <Icon name={level.icon} size={14} color={isSelected ? '#fff' : '#64748b'} />
                        <span className={`ml-1.5 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {level.label}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            />
          </div>
        </Section>

        <Section title="Dates">
          <Controller control={control} name="startDate" render={({ field: { value, onChange } }) => <DateField label="Start date" value={value} onChange={onChange} mode="date" />} />
          <Controller control={control} name="dueDate" render={({ field: { value, onChange } }) => <DateField label="Due date" value={value} onChange={onChange} mode="datetime" />} />
        </Section>

        <Section title="Time tracking">
          <div className="flex flex-row gap-3">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Estimated (min)</p>
              <Controller
                control={control}
                name="estimatedMinutes"
                render={({ field: { value, onChange } }) => (
                  <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    aria-label="Estimated minutes"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
                  />
                )}
              />
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Actual (min)</p>
              <Controller
                control={control}
                name="actualMinutes"
                render={({ field: { value, onChange } }) => (
                  <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    aria-label="Actual minutes"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
                  />
                )}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/focus', { state: { entityType: 'task', entityId: task._id, taskTitle: task.title } })}
            className="mt-3 flex w-full flex-row items-center justify-center rounded-xl bg-primary-50 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:bg-primary-950"
          >
            <Icon name="timer-outline" size={18} color="#2563eb" />
            <span className="ml-2 text-sm font-semibold text-primary-600">Start Focus Session</span>
          </button>
        </Section>

        <Section title="Repeat">
          <Controller control={control} name="recurrence" render={({ field: { value, onChange } }) => <RecurrencePicker value={value} onChange={onChange} />} />
        </Section>

        <Section title="Reminders">
          <Controller
            control={control}
            name="reminders"
            render={({ field: { value, onChange } }) => <ReminderPicker value={value} onChange={onChange} dueDate={dueDate} />}
          />
        </Section>

        <Section title="Tags">
          <Controller control={control} name="tags" render={({ field: { value, onChange } }) => <TagInput value={value} onChange={onChange} />} />
        </Section>

        <Section title="Category">
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <input
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value || null)}
                placeholder="e.g. Work, Personal"
                aria-label="Category"
                className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
              />
            )}
          />
        </Section>

        <Section title="Color & emoji">
          <Controller
            control={control}
            name="color"
            render={({ field: { value: color, onChange: onChangeColor } }) => (
              <Controller
                control={control}
                name="emoji"
                render={({ field: { value: emoji, onChange: onChangeEmoji } }) => (
                  <ColorEmojiPicker color={color} emoji={emoji} onChangeColor={onChangeColor} onChangeEmoji={onChangeEmoji} />
                )}
              />
            )}
          />
        </Section>

        <Section title="Subtasks">
          <Controller control={control} name="subtasks" render={({ field: { value, onChange } }) => <SubtaskList value={value} onChange={onChange} />} />
        </Section>

        <Section title="Notes">
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Notes…"
                aria-label="Notes"
                className="min-h-[100px] w-full resize-y rounded-xl border border-gray-300 bg-transparent p-3 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
              />
            )}
          />
        </Section>

        <div className="h-8" />
      </div>
      </PageContainer>

      <Modal visible={showActions} onClose={() => setShowActions(false)} title="Task actions">
        {actions.map((action) => (
          <button
            type="button"
            key={action.label}
            onClick={() => {
              setShowActions(false);
              action.onPress();
            }}
            className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-gray-800"
          >
            <Icon name={action.icon} size={20} color={action.destructive ? '#ef4444' : '#64748b'} />
            <span className={`ml-3 text-base ${action.destructive ? 'text-danger' : 'text-gray-900 dark:text-white'}`}>
              {action.label}
            </span>
          </button>
        ))}
      </Modal>
    </Screen>
  );
}
