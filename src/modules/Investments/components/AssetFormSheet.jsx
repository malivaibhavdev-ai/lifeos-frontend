import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { ASSET_CLASSES, ASSET_CLASS_ORDER, CURRENCIES } from '../../Finance/constants/financeConstants';
import { useCreateAsset } from '../hooks/useInvestments';

function defaultFormState() {
  return { name: '', symbol: '', assetClass: 'stock', currency: 'INR', exchange: '', sector: '', geography: '' };
}

export function AssetFormSheet({ visible, onClose }) {
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createAsset = useCreateAsset();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState());
      setSaveError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Asset name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createAsset.mutateAsync({
        name: form.name.trim(),
        symbol: form.symbol,
        assetClass: form.assetClass,
        currency: form.currency,
        exchange: form.exchange,
        sector: form.sector,
        geography: form.geography,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save asset');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Asset">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Asset name *"
          className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>

      <div className="mb-4 flex flex-row">
        <input
          value={form.symbol}
          onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          placeholder="Symbol (optional)"
          className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base uppercase text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
        <input
          value={form.exchange}
          onChange={(e) => setForm({ ...form, exchange: e.target.value })}
          placeholder="Exchange"
          className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Asset class</p>
        <div className="flex flex-row overflow-x-auto">
          {ASSET_CLASS_ORDER.map((key) => {
            const isSelected = form.assetClass === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setForm({ ...form, assetClass: key })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{ASSET_CLASSES[key].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Currency</p>
        <div className="flex flex-row overflow-x-auto">
          {CURRENCIES.slice(0, 8).map((c) => {
            const isSelected = form.currency === c.code;
            return (
              <button
                type="button"
                key={c.code}
                onClick={() => setForm({ ...form, currency: c.code })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-row">
        <input
          value={form.sector}
          onChange={(e) => setForm({ ...form, sector: e.target.value })}
          placeholder="Sector (optional)"
          className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
        <input
          value={form.geography}
          onChange={(e) => setForm({ ...form, geography: e.target.value })}
          placeholder="Geography"
          className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>
    </Modal>
  );
}
