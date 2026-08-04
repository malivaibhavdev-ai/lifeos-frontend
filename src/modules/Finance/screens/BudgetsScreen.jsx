import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useBudgetStatuses, useDeleteBudget } from '../hooks/useBudgets';
import { useFinanceSettings } from '../hooks/useFinanceSettings';
import { formatMoney } from '../constants/financeConstants';
import { BudgetFormSheet } from '../components/BudgetFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const BudgetRow = memo(function BudgetRow({ status, baseCurrency, onDelete }) {
  const barColor = status.isOverBudget ? '#ef4444' : status.isAtRisk ? '#f97316' : '#22c55e';
  const widthPercent = Math.min(status.percentUsed, 100);
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(status.budget._id); }}
      className="mx-4 mb-3 block w-[calc(100%-2rem)] rounded-xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-2 flex flex-row items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{status.budget.name}</p>
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs text-gray-400">{status.budget.category?.name ?? 'Overall'}</span>
          <button type="button" aria-label="Delete budget" onClick={() => onDelete(status.budget._id)} className="p-1">
            <Icon name="trash-outline" size={14} color="#ef4444" />
          </button>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-2 rounded-full" style={{ width: `${widthPercent}%`, backgroundColor: barColor }} />
      </div>
      <div className="mt-2 flex flex-row items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatMoney(status.spent, baseCurrency)} of {formatMoney(status.effectiveBudget, baseCurrency)}
        </span>
        <span className="text-xs font-semibold" style={{ color: barColor }}>{status.percentUsed}%</span>
      </div>
    </div>
  );
});

export function BudgetsScreen() {
  const navigate = useNavigate();
  const { data: statuses } = useBudgetStatuses();
  const { data: settings } = useFinanceSettings();
  const deleteBudget = useDeleteBudget();
  const [showForm, setShowForm] = useState(false);
  const baseCurrency = settings?.baseCurrency ?? 'INR';

  const items = statuses ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Budgets</p>
        <button type="button" aria-label="Add budget" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="pie-chart-outline" title="No budgets yet" description="Set a spending limit for a category or your overall spending." ctaLabel="Add Budget" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((status) => <BudgetRow key={status.budget._id} status={status} baseCurrency={baseCurrency} onDelete={deleteBudget.mutate} />)
        )}
      </div>
      </PageContainer>

      <BudgetFormSheet visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
