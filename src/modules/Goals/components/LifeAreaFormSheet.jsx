import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { GOAL_COLORS } from '../constants/goalConstants';
import { useCreateLifeArea, useDeleteLifeArea, useUpdateLifeArea } from '../hooks/useLifeAreas';

function defaultFormState() {
  return { name: '', description: '', color: null };
}

function lifeAreaToFormState(lifeArea) {
  return { name: lifeArea.name, description: lifeArea.description ?? '', color: lifeArea.color ?? null };
}

function Spinner({ size = 16, color = '#fff' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

export function LifeAreaFormSheet({ visible, onClose, lifeArea }) {
  const [form, setForm] = useState(() => (lifeArea ? lifeAreaToFormState(lifeArea) : defaultFormState()));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const nameInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(lifeArea ? lifeAreaToFormState(lifeArea) : defaultFormState());
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [visible, lifeArea]);

  const createLifeArea = useCreateLifeArea();
  const updateLifeArea = useUpdateLifeArea();
  const deleteLifeArea = useDeleteLifeArea();
  const isSaving = createLifeArea.isPending || updateLifeArea.isPending;

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

    const payload = { ...form, description: form.description.trim() || null };
    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this life area. Please try again.');
    };

    if (lifeArea) {
      updateLifeArea.mutate({ id: lifeArea._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createLifeArea.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!lifeArea) return;
    deleteLifeArea.mutate(lifeArea._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={lifeArea ? 'Edit Life Area' : 'New Life Area'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4">
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Life area name *"
            aria-label="Life area name"
            className={`w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showNameError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
          {showNameError ? <p className="mt-2 text-xs font-medium text-danger">Name is required</p> : null}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="e.g. Health, Career, Relationships"
            aria-label="Description"
            className="min-h-[60px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
          />
        </div>

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
          disabled={isSaving || !form.name.trim()}
          className={`flex h-12 w-full flex-row items-center justify-center rounded-xl bg-primary-600 ${
            isSaving || !form.name.trim() ? 'opacity-50' : ''
          }`}
        >
          {isSaving ? <Spinner /> : <span className="text-base font-semibold text-white">Save</span>}
        </button>

        {lifeArea ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLifeArea.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteLifeArea.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Life Area</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
