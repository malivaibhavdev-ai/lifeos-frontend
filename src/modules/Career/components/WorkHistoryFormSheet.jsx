import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreateWorkHistory, useUpdateWorkHistory, useDeleteWorkHistory } from '../hooks/useWorkHistory';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultFormState(entry) {
  if (!entry) return { company: '', position: '', department: '', joiningDate: todayKey(), leavingDate: '', wasPromotion: false, manager: '' };
  return {
    company: entry.company, position: entry.position, department: entry.department ?? '',
    joiningDate: entry.joiningDate?.slice(0, 10) ?? todayKey(),
    leavingDate: entry.leavingDate?.slice(0, 10) ?? '',
    wasPromotion: entry.wasPromotion ?? false, manager: entry.manager ?? '',
  };
}

// Simple pill switch — same inline replacement idiom used across the ported
// FormSheets (Finance's BillFormSheet, this module's SalaryRecordFormSheet).
function ToggleSwitch({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export function WorkHistoryFormSheet({ visible, onClose, entry }) {
  const [form, setForm] = useState(() => defaultFormState(entry));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createEntry = useCreateWorkHistory();
  const updateEntry = useUpdateWorkHistory();
  const deleteEntry = useDeleteWorkHistory();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(entry)); setSaveError(null); }
  }, [visible, entry]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.company.trim() || !form.position.trim()) return setSaveError('Company and position are required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, leavingDate: form.leavingDate || null };
      if (entry) await updateEntry.mutateAsync({ id: entry._id, ...payload });
      else await createEntry.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save entry');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={entry ? 'Edit Position' : 'Add Position'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company *" aria-label="Company" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Position *" aria-label="Position" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" aria-label="Department" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Manager" aria-label="Manager" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <div className="mb-3 flex flex-row">
        <input value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} placeholder="Joining (YYYY-MM-DD) *" aria-label="Joining (YYYY-MM-DD)" className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
        <input value={form.leavingDate} onChange={(e) => setForm({ ...form, leavingDate: e.target.value })} placeholder="Leaving (blank = current)" aria-label="Leaving (blank = current)" className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      </div>
      <div className="mb-3 flex flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className="text-sm text-gray-700 dark:text-gray-300">This was a promotion</span>
        <ToggleSwitch value={form.wasPromotion} onChange={(v) => setForm({ ...form, wasPromotion: v })} />
      </div>
      {entry ? (
        <button type="button" onClick={() => deleteEntry.mutate(entry._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
