import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useNetWorthCurrent } from '../hooks/useNetWorth';
import { useUpcomingBills } from '../hooks/useBills';
import { useBudgetStatuses } from '../hooks/useBudgets';
import { formatMoney } from '../constants/financeConstants';

const HUB_CARDS = [
  { key: 'Accounts', path: '/finance/accounts', label: 'Accounts', icon: 'wallet-outline', color: '#2563eb' },
  { key: 'Transactions', path: '/finance/transactions', label: 'Transactions', icon: 'swap-horizontal-outline', color: '#3b82f6' },
  { key: 'Budgets', path: '/finance/budgets', label: 'Budgets', icon: 'pie-chart-outline', color: '#f97316' },
  { key: 'Bills', path: '/finance/bills', label: 'Bills', icon: 'receipt-outline', color: '#ef4444' },
  { key: 'Debts', path: '/finance/debts', label: 'Debts & Loans', icon: 'trending-down-outline', color: '#dc2626' },
  { key: 'Portfolios', path: '/finance/investments/portfolios', label: 'Investments', icon: 'trending-up-outline', color: '#22c55e' },
  { key: 'NetWorth', path: '/finance/net-worth', label: 'Net Worth', icon: 'stats-chart-outline', color: '#8b5cf6' },
  { key: 'FinanceSettings', path: '/finance/settings', label: 'Settings', icon: 'settings-outline', color: '#64748b' },
];

function HubCard({ card, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="mb-3 flex w-[47%] sm:w-[31%] lg:w-[23%] flex-col items-start rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${card.color}20` }}>
        <Icon name={card.icon} size={20} color={card.color} />
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{card.label}</p>
    </button>
  );
}

export function FinanceHubScreen() {
  const navigate = useNavigate();
  const { data: netWorth } = useNetWorthCurrent();
  const { data: upcomingBills } = useUpcomingBills({ days: 14 });
  const { data: budgetStatuses } = useBudgetStatuses();

  const atRiskCount = budgetStatuses?.filter((b) => b.isAtRisk).length ?? 0;

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-6xl">
      <div className="px-5 pb-2 pt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Finance</p>
      </div>

      <div className="mx-5 mb-5 rounded-2xl bg-primary-600 p-5">
        <p className="text-sm font-medium text-primary-100">Net Worth</p>
        <p className="mt-1 text-3xl font-bold text-white">
          {netWorth ? formatMoney(netWorth.netWorthBase, netWorth.baseCurrency) : '—'}
        </p>
        {netWorth ? (
          <div className="mt-3 flex flex-row justify-between">
            <div>
              <p className="text-xs text-primary-100">Assets</p>
              <p className="text-sm font-semibold text-white">{formatMoney(netWorth.assetsBase, netWorth.baseCurrency)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-100">Liabilities</p>
              <p className="text-sm font-semibold text-white">{formatMoney(netWorth.liabilitiesBase, netWorth.baseCurrency)}</p>
            </div>
          </div>
        ) : null}
      </div>

      {upcomingBills?.length || atRiskCount > 0 ? (
        <div className="mx-5 mb-5 flex flex-row gap-3">
          {upcomingBills?.length ? (
            <div className="flex-1 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Bills due soon</p>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-200">{upcomingBills.length}</p>
            </div>
          ) : null}
          {atRiskCount > 0 ? (
            <div className="flex-1 rounded-xl bg-red-50 p-3 dark:bg-red-950">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Budgets at risk</p>
              <p className="text-lg font-bold text-red-900 dark:text-red-200">{atRiskCount}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-row flex-wrap justify-between px-5">
        {HUB_CARDS.map((card) => (
          <HubCard key={card.key} card={card} onPress={() => navigate(card.path)} />
        ))}
      </div>
      </PageContainer>
    </Screen>
  );
}
