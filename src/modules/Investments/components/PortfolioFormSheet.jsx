import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { COST_BASIS_METHODS } from '../../Finance/constants/financeConstants';
import { useCreatePortfolio } from '../hooks/useInvestments';

function defaultFormState() {
  return { name: '', broker: '', costBasisMethod: 'FIFO' };
}

export function PortfolioFormSheet({ visible, onClose }) {
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createPortfolio = useCreatePortfolio();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState());
      setSaveError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Portfolio name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createPortfolio.mutateAsync({ name: form.name.trim(), broker: form.broker, costBasisMethod: form.costBasisMethod });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save portfolio');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Portfolio">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Portfolio name *"
          className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>
      <div className="mb-4">
        <input
          value={form.broker}
          onChange={(e) => setForm({ ...form, broker: e.target.value })}
          placeholder="Broker (optional)"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>
      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cost basis method</p>
        <div className="flex flex-row overflow-x-auto">
          {COST_BASIS_METHODS.map((method) => {
            const isSelected = form.costBasisMethod === method;
            return (
              <button
                type="button"
                key={method}
                onClick={() => setForm({ ...form, costBasisMethod: method })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{method}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
