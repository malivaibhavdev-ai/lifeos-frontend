import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { CURRENCIES } from '../../Finance/constants/financeConstants';
import { usePortfolioList, useAssetList, useCreateSipPlan } from '../hooks/useInvestments';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultFormState(defaultPortfolioId) {
  return { portfolio: defaultPortfolioId ?? null, asset: null, amountPerInstallment: '', currency: 'INR', freq: 'MONTHLY', startDate: todayKey() };
}

const FREQ_OPTIONS = ['WEEKLY', 'MONTHLY', 'YEARLY'];

export function SipFormSheet({ visible, onClose, defaultPortfolioId }) {
  const [form, setForm] = useState(() => defaultFormState(defaultPortfolioId));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const { data: portfolios } = usePortfolioList();
  const { data: assets } = useAssetList();
  const createSipPlan = useCreateSipPlan();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState(defaultPortfolioId));
      setSaveError(null);
    }
  }, [visible, defaultPortfolioId]);

  const portfolioList = portfolios ?? [];
  const assetList = assets ?? [];

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.portfolio) return setSaveError('Choose a portfolio');
    if (!form.asset) return setSaveError('Choose an asset');
    if (!form.amountPerInstallment || Number(form.amountPerInstallment) <= 0) return setSaveError('Enter a valid amount');

    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createSipPlan.mutateAsync({
        portfolio: form.portfolio,
        asset: form.asset,
        amountPerInstallment: Number(form.amountPerInstallment),
        currency: form.currency,
        recurrence: { freq: form.freq, interval: 1 },
        startDate: form.startDate,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save SIP plan');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New SIP Plan">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio</p>
        <div className="flex flex-row overflow-x-auto">
          {portfolioList.map((p) => {
            const isSelected = form.portfolio === p._id;
            return (
              <button type="button" key={p._id} onClick={() => setForm({ ...form, portfolio: p._id })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Asset</p>
        <div className="flex flex-row overflow-x-auto">
          {assetList.map((a) => {
            const isSelected = form.asset === a._id;
            return (
              <button type="button" key={a._id} onClick={() => setForm({ ...form, asset: a._id })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{a.symbol || a.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-row">
        <input
          value={form.amountPerInstallment}
          onChange={(e) => setForm({ ...form, amountPerInstallment: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder="Amount per installment *"
          inputMode="decimal"
          className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
        <div className="flex flex-row overflow-x-auto" style={{ maxWidth: 120 }}>
          {CURRENCIES.slice(0, 5).map((c) => (
            <button type="button" key={c.code} onClick={() => setForm({ ...form, currency: c.code })} className={`mr-2 flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-2 ${form.currency === c.code ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs font-medium ${form.currency === c.code ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.code}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</p>
        <div className="flex flex-row">
          {FREQ_OPTIONS.map((freq) => {
            const isSelected = form.freq === freq;
            return (
              <button type="button" key={freq} onClick={() => setForm({ ...form, freq })} className={`mr-2 flex-1 items-center rounded-xl border py-2.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-sm font-semibold capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{freq.toLowerCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
