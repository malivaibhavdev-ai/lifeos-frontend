import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { CURRENCIES } from '../constants/financeConstants';
import { useCreateBill } from '../hooks/useBills';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultFormState() {
  return { name: '', amount: '', currency: 'INR', freq: 'MONTHLY', autopay: false, startDate: todayKey() };
}

const FREQ_OPTIONS = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

// Simple pill switch — no shared Switch component exists yet in the web
// component library, so this is a self-contained inline replacement for
// RN's <Switch>, same visual affordance (track + sliding knob).
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

export function BillFormSheet({ visible, onClose }) {
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createBill = useCreateBill();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState());
      setSaveError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Bill name is required');
    if (!form.amount || Number(form.amount) <= 0) return setSaveError('Enter a valid amount');

    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createBill.mutateAsync({
        name: form.name.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        recurrence: { freq: form.freq, interval: 1 },
        startDate: form.startDate,
        autopay: form.autopay,
        idempotencyKey: `bill-${Date.now()}-${Math.random()}`,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save bill');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Bill">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Bill name *"
          className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>

      <div className="mb-4 flex flex-row">
        <input
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder="Amount *"
          inputMode="decimal"
          className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
        <div className="flex flex-row overflow-x-auto" style={{ maxWidth: 140 }}>
          {CURRENCIES.slice(0, 5).map((c) => {
            const isSelected = form.currency === c.code;
            return (
              <button
                type="button"
                key={c.code}
                onClick={() => setForm({ ...form, currency: c.code })}
                className={`mr-2 flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Repeats</p>
        <div className="flex flex-row overflow-x-auto">
          {FREQ_OPTIONS.map((freq) => {
            const isSelected = form.freq === freq;
            return (
              <button
                type="button"
                key={freq}
                onClick={() => setForm({ ...form, freq })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{freq.toLowerCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-row items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Autopay</span>
        <ToggleSwitch value={form.autopay} onChange={(autopay) => setForm({ ...form, autopay })} />
      </div>
    </Modal>
  );
}
