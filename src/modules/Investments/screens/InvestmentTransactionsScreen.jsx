import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useInvestmentTransactionList, useDeleteInvestmentTransaction } from '../hooks/useInvestments';
import { INVESTMENT_TXN_TYPES, formatMoney } from '../../Finance/constants/financeConstants';
import { InvestmentTransactionFormSheet } from '../components/InvestmentTransactionFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const InvestmentTxnRow = memo(function InvestmentTxnRow({ txn, onDelete }) {
  const canDelete = txn.type !== 'buy' && txn.type !== 'sell';
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); if (canDelete) onDelete(txn._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {INVESTMENT_TXN_TYPES[txn.type]?.label} · {txn.asset?.symbol || txn.asset?.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
      </div>
      <div className="mt-2 flex flex-row items-center justify-between sm:mt-0 sm:justify-end sm:gap-3">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatMoney(txn.baseAmount, txn.baseCurrency)}</span>
        {canDelete ? (
          <button type="button" aria-label="Delete transaction" onClick={() => onDelete(txn._id)} className="p-1">
            <Icon name="trash-outline" size={16} color="#ef4444" />
          </button>
        ) : null}
      </div>
    </div>
  );
});

export function InvestmentTransactionsScreen() {
  const navigate = useNavigate();
  const { data } = useInvestmentTransactionList();
  const deleteTransaction = useDeleteInvestmentTransaction();
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
        <button type="button" aria-label="Record transaction" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="swap-horizontal-outline" title="No investment transactions yet" description="Record a buy, sell, dividend, or other event." ctaLabel="Record Transaction" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((txn) => <InvestmentTxnRow key={txn._id} txn={txn} onDelete={deleteTransaction.mutate} />)
        )}
      </div>
      </PageContainer>

      <InvestmentTransactionFormSheet visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
