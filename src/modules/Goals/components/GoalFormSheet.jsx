import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { DateField } from '../../../components/ui/DateField';
import { GOAL_TYPES, GOAL_TYPES_ORDER, PROGRESS_MODES, PROGRESS_MODES_ORDER, GOAL_COLORS } from '../constants/goalConstants';
import { useVisionList } from '../hooks/useVisions';
import { useCreateGoal, useDeleteGoal, useUpdateGoal } from '../hooks/useGoals';

function defaultFormState(visionId) {
  return {
    title: '',
    description: '',
    type: 'personal',
    vision: visionId ?? null,
    progressMode: 'manual',
    progress: 0,
    keyResults: [],
    startDate: null,
    targetDate: null,
    color: null,
    emoji: null,
  };
}

function goalToFormState(goal) {
  return {
    title: goal.title,
    description: goal.description ?? '',
    type: goal.type ?? 'personal',
    vision: goal.vision ?? null,
    progressMode: goal.progressMode ?? 'manual',
    progress: goal.progress ?? 0,
    keyResults: goal.keyResults ?? [],
    startDate: goal.startDate ? new Date(goal.startDate) : null,
    targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
    color: goal.color ?? null,
    emoji: goal.emoji ?? null,
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
            {opt.icon ? <Icon name={opt.icon} size={14} color={isSelected ? '#fff' : '#64748b'} /> : null}
            <span className={`ml-1.5 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function KeyResultEditorRow({ keyResult, onChange, onRemove }) {
  return (
    <div className="mb-2 flex flex-row items-center rounded-xl border border-gray-200 p-2.5 dark:border-gray-700">
      <input
        value={keyResult.title}
        onChange={(e) => onChange({ ...keyResult, title: e.target.value })}
        placeholder="Key result title"
        aria-label="Key result title"
        className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
      />
      <input
        value={String(keyResult.targetValue ?? '')}
        onChange={(e) => onChange({ ...keyResult, targetValue: e.target.value.replace(/[^0-9.]/g, '') })}
        placeholder="Target"
        inputMode="decimal"
        aria-label="Key result target value"
        className="ml-2 w-16 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
      />
      <input
        value={keyResult.unit ?? ''}
        onChange={(e) => onChange({ ...keyResult, unit: e.target.value })}
        placeholder="Unit"
        aria-label="Key result unit"
        className="ml-2 w-14 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
      />
      <button type="button" onClick={onRemove} aria-label="Remove key result" className="ml-2">
        <Icon name="close-circle" size={20} color="#cbd5e1" />
      </button>
    </div>
  );
}

export function GoalFormSheet({ visible, onClose, goal, defaultVisionId }) {
  const [form, setForm] = useState(() => (goal ? goalToFormState(goal) : defaultFormState(defaultVisionId)));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const titleInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(goal ? goalToFormState(goal) : defaultFormState(defaultVisionId));
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => titleInputRef.current?.focus(), 350);
    }
  }, [visible, goal, defaultVisionId]);

  const { data: visionsData } = useVisionList({});
  const visions = visionsData ?? [];

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const isSaving = createGoal.isPending || updateGoal.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const showTitleError = submitAttempted && !form.title.trim();

  const addKeyResult = () => set({ keyResults: [...form.keyResults, { title: '', targetValue: 100, currentValue: 0, unit: '' }] });
  const updateKeyResult = (index, next) =>
    set({ keyResults: form.keyResults.map((kr, i) => (i === index ? next : kr)) });
  const removeKeyResult = (index) => set({ keyResults: form.keyResults.filter((_, i) => i !== index) });

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    setSubmitAttempted(true);
    if (!form.title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setSaveError(null);

    const payload = {
      ...form,
      description: form.description.trim() || null,
      progress: Number(form.progress) || 0,
      keyResults: form.keyResults
        .filter((kr) => kr.title.trim())
        .map((kr) => ({ ...kr, targetValue: Number(kr.targetValue) || 0, currentValue: Number(kr.currentValue) || 0, unit: kr.unit || null })),
    };

    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this goal. Please try again.');
    };

    if (goal) {
      updateGoal.mutate({ id: goal._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createGoal.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!goal) return;
    deleteGoal.mutate(goal._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={goal ? 'Edit Goal' : 'New Goal'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4 flex flex-row items-center">
          <input
            value={form.emoji ?? ''}
            onChange={(e) => set({ emoji: e.target.value.slice(0, 2) || null })}
            placeholder="🎯"
            aria-label="Goal emoji"
            className="mr-3 h-12 w-12 rounded-xl border border-gray-300 bg-transparent text-center text-xl outline-none placeholder:text-gray-400 dark:border-gray-700"
          />
          <input
            ref={titleInputRef}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Goal title *"
            aria-label="Goal title"
            className={`flex-1 bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showTitleError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
        </div>
        {showTitleError ? <p className="mb-3 -mt-2 text-xs font-medium text-danger">Title is required</p> : null}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="What does success look like?"
            aria-label="Description"
            className="min-h-[60px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
          <ChipRow options={GOAL_TYPES} orderedKeys={GOAL_TYPES_ORDER} selected={form.type} onSelect={(type) => set({ type })} />
        </div>

        {visions.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Vision</p>
            <div className="flex flex-row gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => set({ vision: null })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${!form.vision ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${!form.vision ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>None</span>
              </button>
              {visions.map((v) => {
                const isSelected = form.vision === v._id;
                return (
                  <button
                    type="button"
                    key={v._id}
                    onClick={() => set({ vision: v._id })}
                    className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{v.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Progress mode</p>
          <ChipRow
            options={PROGRESS_MODES}
            orderedKeys={PROGRESS_MODES_ORDER}
            selected={form.progressMode}
            onSelect={(progressMode) => set({ progressMode })}
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            {PROGRESS_MODES[form.progressMode]?.description}
          </p>
        </div>

        {form.progressMode === 'manual' ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Progress ({Math.round(form.progress)}%)</p>
            <div className="flex flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => set({ progress: Math.max(0, form.progress - 10) })}
                aria-label="Decrease progress"
                className="rounded-full border border-gray-300 p-2 dark:border-gray-700"
              >
                <Icon name="remove" size={16} color="#2563eb" />
              </button>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${form.progress}%` }} />
              </div>
              <button
                type="button"
                onClick={() => set({ progress: Math.min(100, form.progress + 10) })}
                aria-label="Increase progress"
                className="rounded-full border border-gray-300 p-2 dark:border-gray-700"
              >
                <Icon name="add" size={16} color="#2563eb" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <div className="mb-1.5 flex flex-row items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Results</p>
            <button type="button" onClick={addKeyResult} className="flex flex-row items-center">
              <Icon name="add-circle-outline" size={16} color="#2563eb" />
              <span className="ml-1 text-xs font-semibold text-primary-600">Add</span>
            </button>
          </div>
          {form.keyResults.map((kr, i) => (
            <KeyResultEditorRow key={i} keyResult={kr} onChange={(next) => updateKeyResult(i, next)} onRemove={() => removeKeyResult(i)} />
          ))}
        </div>

        <DateField label="Start date" value={form.startDate} onChange={(startDate) => set({ startDate })} mode="date" />
        <DateField label="Target date" value={form.targetDate} onChange={(targetDate) => set({ targetDate })} mode="date" />

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Color</p>
          <div className="flex flex-row flex-wrap items-center">
            {GOAL_COLORS.map((swatch) => (
              <button
                type="button"
                key={swatch}
                onClick={() => set({ color: form.color === swatch ? null : swatch })}
                aria-label={`Color ${swatch}`}
                aria-pressed={form.color === swatch}
                className="mb-2 mr-2 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: swatch, opacity: form.color && form.color !== swatch ? 0.4 : 1 }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.title.trim()}
          className={`flex h-12 w-full flex-row items-center justify-center rounded-xl bg-primary-600 ${
            isSaving || !form.title.trim() ? 'opacity-50' : ''
          }`}
        >
          {isSaving ? <Spinner /> : <span className="text-base font-semibold text-white">Save</span>}
        </button>

        {goal ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteGoal.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteGoal.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Goal</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
