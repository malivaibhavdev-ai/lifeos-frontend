import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAllocations } from '../hooks/useInvestments';
import { useFinanceSettings } from '../../Finance/hooks/useFinanceSettings';
import { formatMoney, ASSET_CLASSES, FINANCE_COLORS } from '../../Finance/constants/financeConstants';

const AllocationSection = memo(function AllocationSection({ title, entries, total, baseCurrency, labelFor }) {
  const sorted = useMemo(() => (entries ? Object.entries(entries).sort(([, a], [, b]) => b - a) : []), [entries]);
  if (sorted.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">{title}</p>
      <div className="sm:grid sm:grid-cols-2 sm:gap-3 sm:px-4 lg:grid-cols-3">
        {sorted.map(([key, value], i) => {
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={key} className="mx-4 mb-2 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:mx-0">
              <div className="mb-1.5 flex flex-row items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">{labelFor ? labelFor(key) : key}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatMoney(value, baseCurrency)} · {percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: FINANCE_COLORS[i % FINANCE_COLORS.length] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export function AllocationScreen() {
  const navigate = useNavigate();
  const { data: allocations } = useAllocations();
  const { data: settings } = useFinanceSettings();
  const baseCurrency = settings?.baseCurrency ?? 'INR';

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col" maxWidth="max-w-4xl">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Allocation</p>
        <div className="h-9 w-9" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        <div className="mx-4 mb-5 rounded-2xl bg-primary-600 p-5">
          <p className="text-sm font-medium text-primary-100">Total Invested</p>
          <p className="mt-1 text-2xl font-bold text-white">{allocations ? formatMoney(allocations.totalValueBase, baseCurrency) : '—'}</p>
        </div>

        {allocations ? (
          <>
            <AllocationSection title="By Asset Class" entries={allocations.byAssetClass} total={allocations.totalValueBase} baseCurrency={baseCurrency} labelFor={(k) => ASSET_CLASSES[k]?.label ?? k} />
            <AllocationSection title="By Sector" entries={allocations.bySector} total={allocations.totalValueBase} baseCurrency={baseCurrency} />
            <AllocationSection title="By Geography" entries={allocations.byGeography} total={allocations.totalValueBase} baseCurrency={baseCurrency} />
            <AllocationSection title="By Portfolio" entries={allocations.byPortfolio} total={allocations.totalValueBase} baseCurrency={baseCurrency} />
          </>
        ) : null}
      </div>
      </PageContainer>
    </Screen>
  );
}
