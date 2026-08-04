import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { NOTE_TYPES, NOTE_TYPES_ORDER } from '../constants/noteConstants';
import { useCreateTemplate, useDeleteTemplate, useUpdateTemplate } from '../hooks/useTemplates';

function defaultFormState() {
  return { title: '', content: '', noteType: 'note' };
}

function templateToFormState(template) {
  return { title: template.title, content: template.content ?? '', noteType: template.noteType ?? 'note' };
}

export function TemplateFormSheet({ visible, onClose, template }) {
  const [form, setForm] = useState(() => (template ? templateToFormState(template) : defaultFormState()));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const titleInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setForm(template ? templateToFormState(template) : defaultFormState());
      setSubmitAttempted(false);
      setSaveError(null);
      isSubmittingRef.current = false;
      setTimeout(() => titleInputRef.current?.focus(), 350);
    }
  }, [visible, template]);

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

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

    const handleSuccess = () => {
      isSubmittingRef.current = false;
      onClose();
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this template. Please try again.');
    };

    if (template) {
      updateTemplate.mutate({ id: template._id, payload: form }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createTemplate.mutate(form, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!template) return;
    deleteTemplate.mutate(template._id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={template ? 'Edit Template' : 'New Template'}>
      <div>
        <ErrorBanner message={saveError} />

        <div className="mb-4">
          <input
            ref={titleInputRef}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Template name *"
            aria-label="Template name"
            className={`w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white ${
              showTitleError ? 'border-b-2 border-danger pb-1 placeholder:text-danger' : ''
            }`}
          />
          {showTitleError ? <p className="mt-2 text-xs font-medium text-danger">Name is required</p> : null}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Applies to</p>
          <div className="flex flex-row gap-1.5">
            {NOTE_TYPES_ORDER.map((key) => {
              const meta = NOTE_TYPES[key];
              const isSelected = form.noteType === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set({ noteType: key })}
                  className={`flex flex-row items-center rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <Icon name={meta.icon} size={13} color={isSelected ? '#fff' : '#64748b'} />
                  <span className={`ml-1.5 text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Starting content</p>
          <textarea
            value={form.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder={'# Heading\n\n- [ ] Checklist item'}
            aria-label="Starting content"
            className="min-h-[140px] w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-700 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.title.trim()}
          className={`h-12 w-full flex flex-row items-center justify-center rounded-xl bg-primary-600 ${isSaving || !form.title.trim() ? 'opacity-50' : ''}`}
        >
          <span className="text-base font-semibold text-white">{isSaving ? '…' : 'Save'}</span>
        </button>

        {template ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTemplate.isPending}
            className="mb-4 mt-3 flex w-full items-center justify-center py-2"
          >
            <span className="text-sm font-medium text-danger">{deleteTemplate.isPending ? '…' : 'Delete Template'}</span>
          </button>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </Modal>
  );
}
