import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreateSalaryRecord, useUpdateSalaryRecord, useDeleteSalaryRecord } from '../hooks/useSalaryRecords';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultFormState(record) {
  if (!record) return { date: todayKey(), amount: '', bonus: '', isPromotion: false };
  return {
    date: record.date?.slice(0, 10) ?? todayKey(), amount: String(record.amount ?? ''),
    bonus: record.bonus != null ? String(record.bonus) : '', isPromotion: record.isPromotion ?? false,
  };
}

// Simple pill switch — no shared Switch component exists yet in the web
// component library, so this is a self-contained inline replacement for
// RN's <Switch>, same visual affordance (track + sliding knob), matching
// the idiom used in Finance's BillFormSheet / Calendar's event form sheet.
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

export function SalaryRecordFormSheet({ visible, onClose, record }) {
  const [form, setForm] = useState(() => defaultFormState(record));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createRecord = useCreateSalaryRecord();
  const updateRecord = useUpdateSalaryRecord();
  const deleteRecord = useDeleteSalaryRecord();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(record)); setSaveError(null); }
  }, [visible, record]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.amount || Number(form.amount) <= 0) return setSaveError('Enter a valid amount');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, amount: Number(form.amount), bonus: form.bonus ? Number(form.bonus) : 0 };
      if (record) await updateRecord.mutateAsync({ id: record._id, ...payload });
      else await createRecord.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save salary record');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={record ? 'Edit Salary Record' : 'Add Salary Record'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Date (YYYY-MM-DD) *" aria-label="Date (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Amount *" aria-label="Amount" inputMode="decimal" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Bonus" aria-label="Bonus" inputMode="decimal" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <div className="mb-3 flex flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className="text-sm text-gray-700 dark:text-gray-300">This includes a promotion</span>
        <ToggleSwitch value={form.isPromotion} onChange={(v) => setForm({ ...form, isPromotion: v })} />
      </div>

      {record ? (
        <button type="button" onClick={() => deleteRecord.mutate(record._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
