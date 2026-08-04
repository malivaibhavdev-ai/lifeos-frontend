import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { INVESTMENT_TXN_TYPES, INVESTMENT_TXN_TYPE_ORDER } from '../../Finance/constants/financeConstants';
import { usePortfolioList, useAssetList, useRecordInvestmentTransaction } from '../hooks/useInvestments';

function defaultFormState(defaultPortfolioId) {
  return { type: 'buy', portfolio: defaultPortfolioId ?? null, asset: null, quantity: '', pricePerUnit: '', amount: '', fees: '', splitRatio: '', notes: '' };
}

const NEEDS_QUANTITY_PRICE = ['buy', 'sell'];
const NEEDS_AMOUNT = ['dividend', 'interest', 'fee'];
const NEEDS_SPLIT_RATIO = ['split', 'bonus'];

export function InvestmentTransactionFormSheet({ visible, onClose, defaultPortfolioId }) {
  const [form, setForm] = useState(() => defaultFormState(defaultPortfolioId));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const { data: portfolios } = usePortfolioList();
  const { data: assets } = useAssetList();
  const recordTransaction = useRecordInvestmentTransaction();

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
    if (NEEDS_QUANTITY_PRICE.includes(form.type) && (!form.quantity || !form.pricePerUnit)) {
      return setSaveError('Quantity and price are required');
    }
    if (NEEDS_AMOUNT.includes(form.type) && !form.amount) return setSaveError('Amount is required');
    if (NEEDS_SPLIT_RATIO.includes(form.type) && !form.splitRatio) return setSaveError('Split ratio is required');

    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await recordTransaction.mutateAsync({
        portfolio: form.portfolio,
        asset: form.asset,
        type: form.type,
        quantity: NEEDS_QUANTITY_PRICE.includes(form.type) ? Number(form.quantity) : undefined,
        pricePerUnit: NEEDS_QUANTITY_PRICE.includes(form.type) ? Number(form.pricePerUnit) : undefined,
        amount: NEEDS_AMOUNT.includes(form.type) ? Number(form.amount) : undefined,
        splitRatio: NEEDS_SPLIT_RATIO.includes(form.type) ? Number(form.splitRatio) : undefined,
        fees: form.fees ? Number(form.fees) : 0,
        notes: form.notes,
        idempotencyKey: `invtxn-${Date.now()}-${Math.random()}`,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to record transaction');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="Record Investment Transaction">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <div className="flex flex-row overflow-x-auto">
          {INVESTMENT_TXN_TYPE_ORDER.map((key) => {
            const isSelected = form.type === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setForm({ ...form, type: key })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{INVESTMENT_TXN_TYPES[key].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio</p>
        <div className="flex flex-row overflow-x-auto">
          {portfolioList.map((p) => {
            const isSelected = form.portfolio === p._id;
            return (
              <button
                type="button"
                key={p._id}
                onClick={() => setForm({ ...form, portfolio: p._id })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
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
              <button
                type="button"
                key={a._id}
                onClick={() => setForm({ ...form, asset: a._id })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{a.symbol || a.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {NEEDS_QUANTITY_PRICE.includes(form.type) ? (
        <div className="mb-4 flex flex-row">
          <input
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value.replace(/[^0-9.]/g, '') })}
            placeholder="Quantity *"
            inputMode="decimal"
            className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
          <input
            value={form.pricePerUnit}
            onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value.replace(/[^0-9.]/g, '') })}
            placeholder="Price per unit *"
            inputMode="decimal"
            className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
      ) : null}

      {NEEDS_AMOUNT.includes(form.type) ? (
        <div className="mb-4">
          <input
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, '') })}
            placeholder="Amount *"
            inputMode="decimal"
            className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
      ) : null}

      {NEEDS_SPLIT_RATIO.includes(form.type) ? (
        <div className="mb-4">
          <input
            value={form.splitRatio}
            onChange={(e) => setForm({ ...form, splitRatio: e.target.value.replace(/[^0-9.]/g, '') })}
            placeholder="Ratio (e.g. 2 for 2-for-1) *"
            inputMode="decimal"
            className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
      ) : null}

      {NEEDS_QUANTITY_PRICE.includes(form.type) ? (
        <div className="mb-4">
          <input
            value={form.fees}
            onChange={(e) => setForm({ ...form, fees: e.target.value.replace(/[^0-9.]/g, '') })}
            placeholder="Fees (optional)"
            inputMode="decimal"
            className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
      ) : null}

      <div className="mb-4">
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>
    </Modal>
  );
}
