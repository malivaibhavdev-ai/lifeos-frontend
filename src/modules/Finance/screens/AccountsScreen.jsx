import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useAccountList } from '../hooks/useAccounts';
import { ACCOUNT_TYPES, formatMoney } from '../constants/financeConstants';
import { AccountFormSheet } from '../components/AccountFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const AccountRow = memo(function AccountRow({ account, onOpen, onEdit }) {
  const meta = ACCOUNT_TYPES[account.type];
  const isLiability = account.type === 'credit_card' || account.type === 'loan';
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onEdit(account); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <button type="button" onClick={() => onOpen(account)} className="flex min-w-0 flex-1 flex-row items-center text-left">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900">
          <Icon name={meta?.icon ?? 'wallet-outline'} size={18} color="#2563eb" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{account.name}</p>
          <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">
            {meta?.label ?? account.type} {account.institution ? `· ${account.institution}` : ''}
          </p>
        </div>
      </button>
      <div className="ml-2 flex flex-row items-center gap-2">
        <span className={`text-sm font-bold ${isLiability ? 'text-danger' : 'text-gray-900 dark:text-white'}`}>
          {formatMoney(account.currentBalance, account.currency)}
        </span>
        <button type="button" aria-label="Edit account" onClick={() => onEdit(account)} className="p-1">
          <Icon name="create-outline" size={16} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
});

export function AccountsScreen() {
  const navigate = useNavigate();
  const { data: accounts } = useAccountList();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const items = accounts ?? EMPTY_ARRAY;

  const handleOpen = (account) => navigate(`/finance/transactions?accountId=${account._id}`);
  const handleEdit = (account) => { setEditingAccount(account); setShowForm(true); };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Accounts</p>
        <button
          type="button"
          aria-label="Add account"
          onClick={() => { setEditingAccount(null); setShowForm(true); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600"
        >
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="wallet-outline" title="No accounts yet" description="Add a bank, cash, credit card, or wallet account to start tracking." ctaLabel="Add Account" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((account) => <AccountRow key={account._id} account={account} onOpen={handleOpen} onEdit={handleEdit} />)
        )}
      </div>
      </PageContainer>

      <AccountFormSheet visible={showForm || Boolean(editingAccount)} onClose={() => { setShowForm(false); setEditingAccount(null); }} account={editingAccount} />
    </Screen>
  );
}
