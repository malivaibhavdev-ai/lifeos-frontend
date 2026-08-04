import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { GOAL_COLORS } from '../constants/goalConstants';
import { useLifeAreaList } from '../hooks/useLifeAreas';
import { useCreateVision, useDeleteVision, useUpdateVision } from '../hooks/useVisions';

function defaultFormState(lifeAreaId) {
  return { title: '', description: '', color: null, lifeArea: lifeAreaId ?? null };
}

function visionToFormState(vision) {
  return { title: vision.title, description: vision.description ?? '', color: vision.color ?? null, lifeArea: vision.lifeArea ?? null };
}

function Spinner({ size = 16, color = '#fff' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

export function VisionFormSheet({ visible, onClose, vision, defaultLifeAreaId }) {
  const [form, setForm] = useState(() => (vision ? visionToFormState(vision) : defaultFormState(defaultLifeAreaId)));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const titleInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(vision ? visionToFormState(vision) : defaultFormState(defaultLifeAreaId));
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => titleInputRef.current?.focus(), 350);
    }
  }, [visible, vision, defaultLifeAreaId]);

  const { data: lifeAreasData } = useLifeAreaList({});
  const lifeAreas = lifeAreasData ?? [];

  const createVision = useCreateVision();
  const updateVision = useUpdateVision();
  const deleteVision = useDeleteVision();
  const isSaving = createVision.isPending || updateVision.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const showTitleError = submitAttempted && !form.title.trim();

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    setSubmitAttempted(true);
    if (!form.title.trim()) {
      titleInputRef.current?.focus();
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
      setSaveError(error?.message ?? 'Could not save this vision. Please try again.');
    };

    if (vision) {
      updateVision.mutate({ id: vision._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createVision.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!vision) return;
    deleteVision.mutate(vision._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={vision ? 'Edit Vision' : 'New Vision'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4">
          <input
            ref={titleInputRef}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Vision title *"
            aria-label="Vision title"
            className={`w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showTitleError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
          {showTitleError ? <p className="mt-2 text-xs font-medium text-danger">Title is required</p> : null}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Where do you see this in 5-10 years?"
            aria-label="Description"
            className="min-h-[70px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
          />
        </div>

        {lifeAreas.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Life Area</p>
            <div className="flex flex-row gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => set({ lifeArea: null })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${!form.lifeArea ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${!form.lifeArea ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>None</span>
              </button>
              {lifeAreas.map((la) => {
                const isSelected = form.lifeArea === la._id;
                return (
                  <button
                    type="button"
                    key={la._id}
                    onClick={() => set({ lifeArea: la._id })}
                    className={`flex-shrink-0 rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{la.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

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

        {vision ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteVision.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            {deleteVision.isPending ? <Spinner color="#ef4444" /> : <span className="text-sm font-medium text-danger">Delete Vision</span>}
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
