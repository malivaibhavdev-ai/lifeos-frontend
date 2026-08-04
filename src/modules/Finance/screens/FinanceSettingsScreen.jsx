import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useFinanceSettings, useUpdateFinanceSettings } from '../hooks/useFinanceSettings';
import { useExchangeRateList, useCreateExchangeRate, useDeleteExchangeRate } from '../hooks/useExchangeRates';
import { CURRENCIES } from '../constants/financeConstants';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const ExchangeRateRow = memo(function ExchangeRateRow({ rateItem, onDelete }) {
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(rateItem._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <span className="text-sm text-gray-900 dark:text-white">1 {rateItem.baseCurrency} = {rateItem.rate} {rateItem.quoteCurrency}</span>
      <div className="flex flex-row items-center gap-2">
        <span className="text-xs text-gray-400">{new Date(rateItem.asOf).toLocaleDateString()}</span>
        <button type="button" aria-label="Delete exchange rate" onClick={() => onDelete(rateItem._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function FinanceSettingsScreen() {
  const navigate = useNavigate();
  const { data: settings } = useFinanceSettings();
  const updateSettings = useUpdateFinanceSettings();
  const { data: rates } = useExchangeRateList();
  const createRate = useCreateExchangeRate();
  const deleteRate = useDeleteExchangeRate();

  const [showRateForm, setShowRateForm] = useState(false);
  const [base, setBase] = useState('USD');
  const [quote, setQuote] = useState('INR');
  const [rate, setRate] = useState('');
  const [saveError, setSaveError] = useState(null);

  const handleSaveRate = () => {
    if (!rate || Number(rate) <= 0) return setSaveError('Enter a valid rate');
    createRate.mutate(
      { baseCurrency: base, quoteCurrency: quote, rate: Number(rate) },
      { onSuccess: () => { setShowRateForm(false); setRate(''); setSaveError(null); }, onError: (e) => setSaveError(e?.message) }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Finance Settings</p>
        <div className="h-9 w-9" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">Base Currency</p>
        <div className="mb-4 flex flex-row overflow-x-auto px-4">
          {CURRENCIES.map((c) => {
            const isSelected = settings?.baseCurrency === c.code;
            return (
              <button
                type="button"
                key={c.code}
                onClick={() => updateSettings.mutate({ baseCurrency: c.code })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.code}</span>
              </button>
            );
          })}
        </div>

        <div className="mx-4 mb-2 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold uppercase text-gray-400">Exchange Rates</span>
          <button type="button" onClick={() => setShowRateForm(true)} className="flex flex-row items-center">
            <Icon name="add-circle-outline" size={16} color="#2563eb" />
            <span className="ml-1 text-xs font-semibold text-primary-600">Add</span>
          </button>
        </div>
        {(rates ?? EMPTY_ARRAY).length === 0 ? (
          <p className="mx-4 text-sm text-gray-400">No manual exchange rates yet. Add one to convert between currencies.</p>
        ) : (
          (rates ?? EMPTY_ARRAY).map((r) => <ExchangeRateRow key={r._id} rateItem={r} onDelete={deleteRate.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showRateForm} onClose={() => setShowRateForm(false)} onDone={handleSaveRate} title="New Exchange Rate">
        {saveError ? <ErrorBanner message={saveError} /> : null}
        <div className="mb-4 flex flex-row items-center">
          <div className="flex flex-row overflow-x-auto" style={{ maxWidth: 140 }}>
            {CURRENCIES.slice(0, 6).map((c) => (
              <button type="button" key={c.code} onClick={() => setBase(c.code)} className={`mr-2 whitespace-nowrap rounded-full border px-3 py-2 ${base === c.code ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-xs font-medium ${base === c.code ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.code}</span>
              </button>
            ))}
          </div>
          <span className="mx-2 text-gray-500">=</span>
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="rate"
            inputMode="decimal"
            className="h-10 w-20 rounded-lg border border-gray-300 px-2 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="flex flex-row overflow-x-auto">
          {CURRENCIES.slice(0, 6).map((c) => (
            <button type="button" key={c.code} onClick={() => setQuote(c.code)} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${quote === c.code ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${quote === c.code ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.code}</span>
            </button>
          ))}
        </div>
      </Modal>
    </Screen>
  );
}
