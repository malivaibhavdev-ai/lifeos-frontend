import { memo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTransactionList, useDeleteTransaction } from '../hooks/useTransactions';
import { TRANSACTION_TYPES, formatMoney } from '../constants/financeConstants';
import { TransactionFormSheet } from '../components/TransactionFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const TransactionRow = memo(function TransactionRow({ txn, showAccount, onDelete }) {
  const meta = TRANSACTION_TYPES[txn.type];
  const sign = txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : '';
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(txn._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-row items-center">
        <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${meta.color}20` }}>
          <Icon name={meta.icon} size={16} color={meta.color} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{txn.category?.name ?? meta.label}</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {new Date(txn.date).toLocaleDateString()}
            {showAccount && txn.account?.name ? ` · ${txn.account.name}` : ''}
            {txn.notes ? ` · ${txn.notes}` : ''}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-row items-center justify-between sm:mt-0 sm:justify-end sm:gap-3">
        <span className="text-sm font-bold" style={{ color: meta.color }}>
          {sign}{formatMoney(txn.originalAmount, txn.originalCurrency)}
        </span>
        <button type="button" aria-label="Delete transaction" onClick={() => onDelete(txn._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function TransactionsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId') ?? null;
  const { data } = useTransactionList(accountId ? { account: accountId } : undefined);
  const deleteTransaction = useDeleteTransaction();
  const [showForm, setShowForm] = useState(false);

  const items = data ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Transactions</p>
        <button type="button" aria-label="Add transaction" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="swap-horizontal-outline" title="No transactions yet" description="Log your first income, expense, or transfer." ctaLabel="Add Transaction" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((txn) => <TransactionRow key={txn._id} txn={txn} showAccount={!accountId} onDelete={deleteTransaction.mutate} />)
        )}
      </div>
      </PageContainer>

      <TransactionFormSheet visible={showForm} onClose={() => setShowForm(false)} defaultAccountId={accountId} />
    </Screen>
  );
}
