import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { CURRENCIES, DEBT_TYPES, DEBT_TYPE_ORDER } from '../constants/financeConstants';
import { useCreateDebt } from '../hooks/useDebts';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultFormState() {
  return { name: '', type: 'loan', principal: '', currency: 'INR', interestRateAnnualPercent: '', termMonths: '', startDate: todayKey() };
}

export function DebtFormSheet({ visible, onClose }) {
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createDebt = useCreateDebt();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState());
      setSaveError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Name is required');
    if (!form.principal || Number(form.principal) <= 0) return setSaveError('Enter a valid principal amount');

    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createDebt.mutateAsync({
        name: form.name.trim(),
        type: form.type,
        principal: Number(form.principal),
        currency: form.currency,
        interestRateAnnualPercent: Number(form.interestRateAnnualPercent) || 0,
        termMonths: form.termMonths ? Number(form.termMonths) : undefined,
        startDate: form.startDate,
        idempotencyKey: `debt-${Date.now()}-${Math.random()}`,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save debt');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Debt">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Debt name *"
          className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>

      <div className="mb-4">
        <div className="flex flex-row overflow-x-auto">
          {DEBT_TYPE_ORDER.map((key) => {
            const isSelected = form.type === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setForm({ ...form, type: key })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{DEBT_TYPES[key].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-row">
        <input
          value={form.principal}
          onChange={(e) => setForm({ ...form, principal: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder="Principal *"
          inputMode="decimal"
          className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
        <div className="flex flex-row overflow-x-auto" style={{ maxWidth: 120 }}>
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

      <div className="mb-4 flex flex-row">
        <input
          value={form.interestRateAnnualPercent}
          onChange={(e) => setForm({ ...form, interestRateAnnualPercent: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder="Annual interest %"
          inputMode="decimal"
          className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
        <input
          value={form.termMonths}
          onChange={(e) => setForm({ ...form, termMonths: e.target.value.replace(/[^0-9]/g, '') })}
          placeholder="Term (months)"
          inputMode="numeric"
          className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>
    </Modal>
  );
}
