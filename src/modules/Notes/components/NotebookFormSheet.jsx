import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { NOTE_COLORS } from '../constants/noteConstants';
import { useCreateNotebook, useDeleteNotebook, useUpdateNotebook } from '../hooks/useNotebooks';

function defaultFormState() {
  return { name: '', description: '', color: null };
}

function notebookToFormState(notebook) {
  return { name: notebook.name, description: notebook.description ?? '', color: notebook.color ?? null };
}

export function NotebookFormSheet({ visible, onClose, notebook }) {
  const [form, setForm] = useState(() => (notebook ? notebookToFormState(notebook) : defaultFormState()));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const nameInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(notebook ? notebookToFormState(notebook) : defaultFormState());
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [visible, notebook]);

  const createNotebook = useCreateNotebook();
  const updateNotebook = useUpdateNotebook();
  const deleteNotebook = useDeleteNotebook();
  const isSaving = createNotebook.isPending || updateNotebook.isPending;

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
      setSaveError(error?.message ?? 'Could not save this notebook. Please try again.');
    };

    if (notebook) {
      updateNotebook.mutate({ id: notebook._id, payload }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createNotebook.mutate(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!notebook) return;
    deleteNotebook.mutate(notebook._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={notebook ? 'Edit Notebook' : 'New Notebook'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4">
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Notebook name *"
            aria-label="Notebook name"
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
            placeholder="What lives in this notebook?"
            aria-label="Description"
            className="min-h-[60px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Color</p>
          <div className="flex flex-row flex-wrap items-center">
            {NOTE_COLORS.map((swatch) => (
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
          className={`h-12 w-full flex flex-row items-center justify-center rounded-xl bg-primary-600 ${isSaving || !form.name.trim() ? 'opacity-50' : ''}`}
        >
          <span className="text-base font-semibold text-white">{isSaving ? '…' : 'Save'}</span>
        </button>

        {notebook ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteNotebook.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            <span className="text-sm font-medium text-danger">{deleteNotebook.isPending ? '…' : 'Delete Notebook'}</span>
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
