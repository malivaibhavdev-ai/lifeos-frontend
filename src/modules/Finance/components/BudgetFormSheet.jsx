import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PERIOD_TYPES, PERIOD_TYPE_ORDER } from '../constants/financeConstants';
import { useCategoryList } from '../hooks/useCategories';
import { useCreateBudget } from '../hooks/useBudgets';

function defaultFormState() {
  return { name: '', category: null, amountBase: '', periodType: 'monthly', rolloverEnabled: false };
}

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

export function BudgetFormSheet({ visible, onClose }) {
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const { data: categories } = useCategoryList({ type: 'expense' });
  const createBudget = useCreateBudget();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState());
      setSaveError(null);
    }
  }, [visible]);

  const categoryList = categories ?? [];

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Budget name is required');
    if (!form.amountBase || Number(form.amountBase) <= 0) return setSaveError('Enter a valid amount');

    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createBudget.mutateAsync({
        name: form.name.trim(),
        category: form.category,
        amountBase: Number(form.amountBase),
        periodType: form.periodType,
        rolloverEnabled: form.rolloverEnabled,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save budget');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Budget">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Budget name *"
          className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>

      <div className="mb-4">
        <input
          value={form.amountBase}
          onChange={(e) => setForm({ ...form, amountBase: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder="Amount (base currency) *"
          inputMode="decimal"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category (optional — leave blank for overall)</p>
        <div className="flex flex-row overflow-x-auto">
          <button
            type="button"
            onClick={() => setForm({ ...form, category: null })}
            className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${!form.category ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <span className={`text-sm font-medium ${!form.category ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>Overall</span>
          </button>
          {categoryList.map((c) => {
            const isSelected = form.category === c._id;
            return (
              <button
                type="button"
                key={c._id}
                onClick={() => setForm({ ...form, category: c._id })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Period</p>
        <div className="flex flex-row">
          {PERIOD_TYPE_ORDER.map((key) => {
            const isSelected = form.periodType === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setForm({ ...form, periodType: key })}
                className={`mr-2 flex-1 items-center rounded-xl border py-2.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{PERIOD_TYPES[key].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-row items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Roll over unused amount</span>
        <ToggleSwitch value={form.rolloverEnabled} onChange={(rolloverEnabled) => setForm({ ...form, rolloverEnabled })} />
      </div>
    </Modal>
  );
}
