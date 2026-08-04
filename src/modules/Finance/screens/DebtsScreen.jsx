import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useDebtList, useDeleteDebt } from '../hooks/useDebts';
import { DEBT_TYPES, formatMoney } from '../constants/financeConstants';
import { DebtFormSheet } from '../components/DebtFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const DebtRow = memo(function DebtRow({ debt, onOpen, onDelete }) {
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(debt._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <button type="button" onClick={() => onOpen(debt)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{debt.name}</p>
        <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">{DEBT_TYPES[debt.type]?.label} · {debt.interestRateAnnualPercent}% APR</p>
      </button>
      <div className="ml-2 flex flex-row items-center gap-2">
        <span className="text-sm font-bold text-danger">{formatMoney(debt.principal, debt.currency)}</span>
        <button type="button" aria-label="Delete debt" onClick={() => onDelete(debt._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function DebtsScreen() {
  const navigate = useNavigate();
  const { data: debts } = useDebtList();
  const deleteDebt = useDeleteDebt();
  const [showForm, setShowForm] = useState(false);

  const items = debts ?? EMPTY_ARRAY;
  const handleOpen = (debt) => navigate(`/finance/debts/${debt._id}`);

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Debts & Loans</p>
        <button type="button" aria-label="Add debt" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="trending-down-outline" title="No debts tracked" description="Add a loan, credit card, or mortgage to track payoff progress." ctaLabel="Add Debt" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((debt) => <DebtRow key={debt._id} debt={debt} onOpen={handleOpen} onDelete={deleteDebt.mutate} />)
        )}
      </div>
      </PageContainer>

      <DebtFormSheet visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
