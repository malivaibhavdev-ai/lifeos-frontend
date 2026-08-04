import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { TRANSACTION_TYPES } from '../constants/financeConstants';
import { useAccountList } from '../hooks/useAccounts';
import { useCategoryList } from '../hooks/useCategories';
import { useCreateTransaction } from '../hooks/useTransactions';

function defaultFormState(defaultAccountId) {
  return { type: 'expense', account: defaultAccountId ?? null, category: null, transferAccount: null, originalAmount: '', notes: '' };
}

export function TransactionFormSheet({ visible, onClose, defaultAccountId }) {
  const [form, setForm] = useState(() => defaultFormState(defaultAccountId));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const { data: accounts } = useAccountList();
  const { data: categories } = useCategoryList({ type: form.type === 'income' ? 'income' : 'expense' });
  const createTransaction = useCreateTransaction();

  useEffect(() => {
    if (visible) {
      setForm(defaultFormState(defaultAccountId));
      setSaveError(null);
    }
  }, [visible, defaultAccountId]);

  const accountList = accounts ?? [];
  const categoryList = categories ?? [];
  const selectedAccount = accountList.find((a) => a._id === form.account);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.account) return setSaveError('Choose an account');
    if (!form.originalAmount || Number(form.originalAmount) <= 0) return setSaveError('Enter a valid amount');
    if (form.type !== 'transfer' && !form.category) return setSaveError('Choose a category');
    if (form.type === 'transfer' && !form.transferAccount) return setSaveError('Choose a destination account');

    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      await createTransaction.mutateAsync({
        account: form.account,
        type: form.type,
        category: form.type === 'transfer' ? undefined : form.category,
        transferAccount: form.type === 'transfer' ? form.transferAccount : undefined,
        originalAmount: Number(form.originalAmount),
        originalCurrency: selectedAccount?.currency,
        notes: form.notes,
        idempotencyKey: `txn-${Date.now()}-${Math.random()}`,
      });
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save transaction');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Transaction">
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4 flex flex-row">
        {Object.values(TRANSACTION_TYPES).map((t) => {
          const isSelected = form.type === t.key;
          return (
            <button
              type="button"
              key={t.key}
              onClick={() => setForm({ ...form, type: t.key, category: null })}
              className={`mr-2 flex-1 items-center rounded-xl border py-2.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <input
          value={form.originalAmount}
          onChange={(e) => setForm({ ...form, originalAmount: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder={`Amount ${selectedAccount ? `(${selectedAccount.currency})` : ''} *`}
          inputMode="decimal"
          className="w-full bg-transparent text-2xl font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Account</p>
        <div className="flex flex-row overflow-x-auto">
          {accountList.map((a) => {
            const isSelected = form.account === a._id;
            return (
              <button
                type="button"
                key={a._id}
                onClick={() => setForm({ ...form, account: a._id })}
                className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{a.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {form.type === 'transfer' ? (
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">To account</p>
          <div className="flex flex-row overflow-x-auto">
            {accountList.filter((a) => a._id !== form.account).map((a) => {
              const isSelected = form.transferAccount === a._id;
              return (
                <button
                  type="button"
                  key={a._id}
                  onClick={() => setForm({ ...form, transferAccount: a._id })}
                  className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{a.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
          <div className="flex flex-row overflow-x-auto">
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
      )}

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
