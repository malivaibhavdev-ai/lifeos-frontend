import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { TASK_COLORS } from '../../Tasks/constants/taskConstants';
import { ROUTINE_TIME_OF_DAY, ROUTINE_TIME_OF_DAY_ORDER } from '../constants/habitConstants';
import { useCreateRoutine, useDeleteRoutine, useUpdateRoutine } from '../hooks/useRoutines';

function defaultFormState() {
  return { name: '', timeOfDay: 'morning', color: null };
}

function routineToFormState(routine) {
  return { name: routine.name, timeOfDay: routine.timeOfDay, color: routine.color ?? null };
}

function Spinner({ size = 16, color = '#fff' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

export function RoutineFormSheet({ visible, onClose, routine, onCreated }) {
  const [form, setForm] = useState(() => (routine ? routineToFormState(routine) : defaultFormState()));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setForm(routine ? routineToFormState(routine) : defaultFormState());
      setSubmitAttempted(false);
      setSaveError(null);
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [visible, routine]);

  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();
  const deleteRoutine = useDeleteRoutine();
  const isSaving = createRoutine.isPending || updateRoutine.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const showNameError = submitAttempted && !form.name.trim();

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!form.name.trim()) {
      nameInputRef.current?.focus();
      return;
    }
    setSaveError(null);
    const onSuccess = (created) => {
      onClose();
      if (!routine) onCreated?.(created);
    };
    const onError = (error) => setSaveError(error?.message ?? 'Could not save this routine. Please try again.');

    if (routine) updateRoutine.mutate({ id: routine._id, payload: form }, { onSuccess, onError });
    else createRoutine.mutate(form, { onSuccess, onError });
  };

  const handleDelete = () => {
    if (!routine) return;
    deleteRoutine.mutate(routine._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={routine ? 'Edit Routine' : 'New Routine'}>
      <div>
        <ErrorBanner message={saveError} />

        <input
          ref={nameInputRef}
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Routine name *"
          aria-label="Routine name"
          className={`mb-1 w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
            showNameError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
          }`}
        />
        {showNameError ? <p className="mb-3 text-xs font-medium text-danger">Name is required</p> : <div className="mb-4" />}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Time of day</p>
          <div className="flex flex-row flex-wrap gap-2">
            {ROUTINE_TIME_OF_DAY_ORDER.map((key) => {
              const opt = ROUTINE_TIME_OF_DAY[key];
              const isSelected = form.timeOfDay === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set({ timeOfDay: key })}
                  className={`flex flex-row items-center rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <Icon name={opt.icon} size={14} color={isSelected ? '#fff' : '#64748b'} />
                  <span className={`ml-1.5 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.name.trim()}
          className={`flex h-12 w-full flex-row items-center justify-center rounded-xl bg-primary-600 ${isSaving || !form.name.trim() ? 'opacity-50' : ''}`}
        >
          {isSaving ? <Spinner /> : <span className="text-base font-semibold text-white">Save</span>}
        </button>

        {routine ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteRoutine.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteRoutine.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Routine</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
