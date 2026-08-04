import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { RecurrencePicker } from '../../Tasks/components/RecurrencePicker';
import { TASK_COLORS } from '../../Tasks/constants/taskConstants';
import { ESCALATION_LEVEL_ORDER, getEscalationPolicy } from '../../../constants/reminderPolicies';
import { ReminderTimeField } from './ReminderTimeField';
import {
  HABIT_TYPE,
  HABIT_TYPE_ORDER,
  TRACKING_TYPE,
  TRACKING_TYPE_ORDER,
  PERIOD_UNIT,
  UNIT_SUGGESTIONS,
} from '../constants/habitConstants';
import { useCreateHabit, useDeleteHabit, useUpdateHabit } from '../hooks/useHabits';
import { useRoutineList } from '../hooks/useRoutines';

function defaultFormState() {
  return {
    name: '',
    description: '',
    type: 'build',
    trackingType: 'boolean',
    targetValue: 1,
    unit: '',
    scheduleType: 'recurrence',
    recurrence: { freq: 'DAILY', interval: 1 },
    timesPerPeriod: 3,
    periodUnit: 'week',
    color: null,
    emoji: null,
    reminderTime: null,
    reminderEscalation: 'normal',
    freezeCreditsTotal: 0,
    routine: null,
  };
}

function habitToFormState(habit) {
  return {
    name: habit.name,
    description: habit.description ?? '',
    type: habit.type,
    trackingType: habit.trackingType,
    targetValue: habit.targetValue ?? 1,
    unit: habit.unit ?? '',
    scheduleType: habit.scheduleType,
    recurrence: habit.recurrence ?? { freq: 'DAILY', interval: 1 },
    timesPerPeriod: habit.timesPerPeriod ?? 3,
    periodUnit: habit.periodUnit ?? 'week',
    color: habit.color ?? null,
    emoji: habit.emoji ?? null,
    reminderTime: habit.reminderTime ?? null,
    reminderEscalation: habit.reminderEscalation ?? 'normal',
    freezeCreditsTotal: habit.freezeCreditsTotal ?? 0,
    routine: habit.routine ?? null,
  };
}

function Spinner({ size = 16, color = '#fff' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

function ChipRow({ options, orderedKeys, selected, onSelect }) {
  return (
    <div className="flex flex-row gap-2 overflow-x-auto pb-1">
      {orderedKeys.map((key) => {
        const opt = options[key];
        const isSelected = selected === key;
        return (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-shrink-0 flex-row items-center rounded-full border px-3.5 py-2 ${
              isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Icon name={opt.icon} size={14} color={isSelected ? '#fff' : '#64748b'} />
            <span className={`ml-1.5 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function HabitFormSheet({ visible, onClose, habit }) {
  const [form, setForm] = useState(() => (habit ? habitToFormState(habit) : defaultFormState()));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const nameInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(habit ? habitToFormState(habit) : defaultFormState());
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [visible, habit]);

  const { data: routinesData } = useRoutineList({});
  const routines = routinesData ?? [];

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const isSaving = createHabit.isPending || updateHabit.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const showNameError = submitAttempted && !form.name.trim();

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    setSubmitAttempted(true);
    if (!form.name.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setSaveError(null);

    const payload = {
      ...form,
      unit: form.unit.trim() || null,
      targetValue: Number(form.targetValue) || 1,
      timesPerPeriod: form.scheduleType === 'timesPerPeriod' ? Number(form.timesPerPeriod) || 1 : null,
      recurrence: form.scheduleType === 'recurrence' ? form.recurrence : null,
    };

    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this habit. Please try again.');
    };

    if (habit) {
      updateHabit.mutate({ id: habit._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createHabit.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!habit) return;
    deleteHabit.mutate(habit._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={habit ? 'Edit Habit' : 'New Habit'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4 flex flex-row items-center">
          <input
            value={form.emoji ?? ''}
            onChange={(e) => set({ emoji: e.target.value.slice(0, 2) || null })}
            placeholder="🙂"
            aria-label="Habit emoji"
            className="mr-3 h-12 w-12 rounded-xl border border-gray-300 bg-transparent text-center text-xl outline-none placeholder:text-gray-400 dark:border-gray-700"
          />
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Habit name *"
            aria-label="Habit name"
            className={`flex-1 bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showNameError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
        </div>
        {showNameError ? <p className="mb-3 -mt-2 text-xs font-medium text-danger">Name is required</p> : null}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
          <ChipRow options={HABIT_TYPE} orderedKeys={HABIT_TYPE_ORDER} selected={form.type} onSelect={(type) => set({ type })} />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Tracking</p>
          <ChipRow
            options={TRACKING_TYPE}
            orderedKeys={TRACKING_TYPE_ORDER}
            selected={form.trackingType}
            onSelect={(trackingType) => set({ trackingType })}
          />
        </div>

        {form.trackingType !== 'boolean' ? (
          <div className="mb-4 flex flex-row gap-3">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Target</p>
              <input
                value={String(form.targetValue)}
                onChange={(e) => set({ targetValue: e.target.value.replace(/[^0-9.]/g, '') })}
                inputMode="decimal"
                placeholder="1"
                aria-label="Target value"
                className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Unit</p>
              <input
                value={form.unit}
                onChange={(e) => set({ unit: e.target.value })}
                placeholder={UNIT_SUGGESTIONS.join(', ')}
                aria-label="Unit"
                className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</p>
          <div className="mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
            {['recurrence', 'timesPerPeriod'].map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => set({ scheduleType: key })}
                className={`flex-1 items-center rounded-lg py-2 ${form.scheduleType === key ? 'bg-white dark:bg-gray-800' : ''}`}
              >
                <span className={`text-xs font-semibold ${form.scheduleType === key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {key === 'recurrence' ? 'Fixed days' : 'X times per period'}
                </span>
              </button>
            ))}
          </div>

          {form.scheduleType === 'recurrence' ? (
            <RecurrencePicker value={form.recurrence} onChange={(recurrence) => set({ recurrence })} />
          ) : (
            <div className="flex flex-row items-center gap-3">
              <div className="flex flex-row items-center rounded-xl border border-gray-300 px-1 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => set({ timesPerPeriod: Math.max(1, form.timesPerPeriod - 1) })}
                  aria-label="Decrease times per period"
                  className="p-2.5"
                >
                  <Icon name="remove" size={18} color="#2563eb" />
                </button>
                <span className="mx-2 text-base font-semibold text-gray-900 dark:text-white">{form.timesPerPeriod}</span>
                <button
                  type="button"
                  onClick={() => set({ timesPerPeriod: form.timesPerPeriod + 1 })}
                  aria-label="Increase times per period"
                  className="p-2.5"
                >
                  <Icon name="add" size={18} color="#2563eb" />
                </button>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">times per</span>
              <div className="flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
                {Object.keys(PERIOD_UNIT).map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => set({ periodUnit: key })}
                    className={`rounded-lg px-3 py-1.5 ${form.periodUnit === key ? 'bg-white dark:bg-gray-800' : ''}`}
                  >
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{PERIOD_UNIT[key].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Color</p>
          <div className="flex flex-row items-center">
            {TASK_COLORS.map((swatch) => (
              <button
                type="button"
                key={swatch}
                onClick={() => set({ color: form.color === swatch ? null : swatch })}
                aria-label={`Color ${swatch}`}
                aria-pressed={form.color === swatch}
                className="mr-2 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: swatch }}
              >
                {form.color === swatch ? <Icon name="checkmark" size={16} color="#fff" /> : null}
              </button>
            ))}
          </div>
        </div>

        {routines.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Routine</p>
            <div className="flex flex-row gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => set({ routine: null })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${!form.routine ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${!form.routine ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>None</span>
              </button>
              {routines.map((routine) => {
                const isSelected = form.routine === routine._id;
                return (
                  <button
                    type="button"
                    key={routine._id}
                    onClick={() => set({ routine: routine._id })}
                    className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{routine.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <ReminderTimeField label="Reminder" value={form.reminderTime} onChange={(reminderTime) => set({ reminderTime })} />

        {form.reminderTime ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Escalation</p>
            <div className="flex flex-row gap-1.5">
              {ESCALATION_LEVEL_ORDER.map((level) => {
                const policy = getEscalationPolicy(level);
                const isSelected = form.reminderEscalation === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => set({ reminderEscalation: level })}
                    className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
                  >
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{policy.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Freeze credits</p>
          <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
            Skip up to this many days without breaking your streak.
          </p>
          <div className="flex w-fit flex-row items-center rounded-xl border border-gray-300 px-1 dark:border-gray-700">
            <button
              type="button"
              onClick={() => set({ freezeCreditsTotal: Math.max(0, form.freezeCreditsTotal - 1) })}
              aria-label="Decrease freeze credits"
              className="p-2.5"
            >
              <Icon name="remove" size={18} color="#2563eb" />
            </button>
            <span className="mx-2 text-base font-semibold text-gray-900 dark:text-white">{form.freezeCreditsTotal}</span>
            <button
              type="button"
              onClick={() => set({ freezeCreditsTotal: form.freezeCreditsTotal + 1 })}
              aria-label="Increase freeze credits"
              className="p-2.5"
            >
              <Icon name="add" size={18} color="#2563eb" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.name.trim()}
          className={`flex h-12 w-full flex-row items-center justify-center rounded-xl bg-primary-600 ${isSaving || !form.name.trim() ? 'opacity-50' : ''}`}
        >
          {isSaving ? <Spinner /> : <span className="text-base font-semibold text-white">Save</span>}
        </button>

        {habit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteHabit.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteHabit.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Habit</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
