import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_ORDER, CURRENCIES } from '../constants/financeConstants';
import { useCreateAccount, useUpdateAccount } from '../hooks/useAccounts';

function defaultFormState() {
  return { name: '', type: 'bank', currency: 'INR', openingBalance: '0', institution: '' };
}

function toFormState(account) {
  return {
    name: account.name,
    type: account.type,
    currency: account.currency,
    openingBalance: String(account.openingBalance ?? 0),
    institution: account.institution ?? '',
  };
}

export function AccountFormSheet({ visible, onClose, account }) {
  const [form, setForm] = useState(() => (account ? toFormState(account) : defaultFormState()));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  useEffect(() => {
    if (visible) {
      setForm(account ? toFormState(account) : defaultFormState());
      setSaveError(null);
    }
  }, [visible, account]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) {
      setSaveError('Account name is required');
      return;
    }
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      if (account) {
        await updateAccount.mutateAsync({ id: account._id, name: form.name.trim(), institution: form.institution });
      } else {
        await createAccount.mutateAsync({
          name: form.name.trim(),
          type: form.type,
          currency: form.currency,
          openingBalance: Number(form.openingBalance) || 0,
          institution: form.institution,
          idempotencyKey: `account-${Date.now()}-${Math.random()}`,
        });
      }
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save account');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={account ? 'Edit Account' : 'New Account'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <div className="mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Account name *"
          className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
        />
      </div>

      {!account ? (
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
          <div className="flex flex-row overflow-x-auto">
            {ACCOUNT_TYPE_ORDER.map((key) => {
              const isSelected = form.type === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setForm({ ...form, type: key })}
                  className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{ACCOUNT_TYPES[key].label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!account ? (
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
      ) : null}

      {!account ? (
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Opening balance</p>
          <input
            value={form.openingBalance}
            onChange={(e) => setForm({ ...form, openingBalance: e.target.value.replace(/[^0-9.-]/g, '') })}
            inputMode="decimal"
            className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
      ) : null}

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Institution</p>
        <input
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
          placeholder="e.g. HDFC Bank"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
        />
      </div>
    </Modal>
  );
}
