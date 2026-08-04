import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { LEARNING_PLATFORMS, LEARNING_PLATFORM_ORDER, LEARNING_STATUS } from '../constants/careerConstants';
import { useCreateLearningItem, useUpdateLearningItem, useDeleteLearningItem } from '../hooks/useLearningItems';

function defaultFormState(item) {
  if (!item) return { title: '', platform: 'course', status: 'not_started', totalHours: '', hoursCompleted: '0', deadline: '' };
  return {
    title: item.title, platform: item.platform, status: item.status,
    totalHours: item.totalHours != null ? String(item.totalHours) : '',
    hoursCompleted: String(item.hoursCompleted ?? 0), deadline: item.deadline?.slice(0, 10) ?? '',
  };
}

export function LearningItemFormSheet({ visible, onClose, item }) {
  const [form, setForm] = useState(() => defaultFormState(item));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createItem = useCreateLearningItem();
  const updateItem = useUpdateLearningItem();
  const deleteItem = useDeleteLearningItem();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(item)); setSaveError(null); }
  }, [visible, item]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.title.trim()) return setSaveError('Title is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = {
        ...form, totalHours: form.totalHours ? Number(form.totalHours) : undefined,
        hoursCompleted: Number(form.hoursCompleted) || 0, deadline: form.deadline || null,
      };
      if (item) await updateItem.mutateAsync({ id: item._id, ...payload });
      else await createItem.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save learning item');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={item ? 'Edit Learning Item' : 'Add Learning Item'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title *" aria-label="Title" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <div className="mb-3 flex flex-row overflow-x-auto">
        {LEARNING_PLATFORM_ORDER.map((key) => {
          const isSelected = form.platform === key;
          return (
            <button type="button" key={key} onClick={() => setForm({ ...form, platform: key })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{LEARNING_PLATFORMS[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex flex-row overflow-x-auto">
        {LEARNING_STATUS.map((status) => {
          const isSelected = form.status === status;
          return (
            <button type="button" key={status} onClick={() => setForm({ ...form, status })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{status.replace('_', ' ')}</span>
            </button>
          );
        })}
      </div>

      <input value={form.hoursCompleted} onChange={(e) => setForm({ ...form, hoursCompleted: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Hours completed" aria-label="Hours completed" inputMode="decimal" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.totalHours} onChange={(e) => setForm({ ...form, totalHours: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Total hours (optional)" aria-label="Total hours (optional)" inputMode="decimal" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="Deadline (YYYY-MM-DD)" aria-label="Deadline (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      {item ? (
        <button type="button" onClick={() => deleteItem.mutate(item._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
