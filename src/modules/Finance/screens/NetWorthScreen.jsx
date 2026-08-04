import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useNetWorthCurrent, useNetWorthTrend } from '../hooks/useNetWorth';
import { formatMoney } from '../constants/financeConstants';

const BREAKDOWN_LABELS = {
  cash: 'Cash', bank: 'Bank', investments: 'Investments', otherAssets: 'Other Assets',
  creditCards: 'Credit Cards', loans: 'Loans', otherLiabilities: 'Other Liabilities',
};

const ASSET_KEYS = ['cash', 'bank', 'investments', 'otherAssets'];
const LIABILITY_KEYS = ['creditCards', 'loans', 'otherLiabilities'];

export function NetWorthScreen() {
  const navigate = useNavigate();
  const { data: netWorth } = useNetWorthCurrent();
  const { data: trend } = useNetWorthTrend();

  const maxNetWorth = useMemo(
    () => (trend?.length ? Math.max(...trend.map((t) => Math.abs(t.netWorthBase)), 1) : 1),
    [trend]
  );

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col" maxWidth="max-w-3xl">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Net Worth</p>
        <div className="h-9 w-9" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        <div className="mx-4 mb-5 rounded-2xl bg-primary-600 p-5">
          <p className="text-sm font-medium text-primary-100">Net Worth</p>
          <p className="mt-1 text-3xl font-bold text-white">{netWorth ? formatMoney(netWorth.netWorthBase, netWorth.baseCurrency) : '—'}</p>
        </div>

        {netWorth ? (
          <>
            <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">Assets — {formatMoney(netWorth.assetsBase, netWorth.baseCurrency)}</p>
            {ASSET_KEYS.map((key) => netWorth.breakdown[key] > 0 ? (
              <div key={key} className="mx-4 mb-2 flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-sm text-gray-900 dark:text-white">{BREAKDOWN_LABELS[key]}</span>
                <span className="text-sm font-semibold text-success">{formatMoney(netWorth.breakdown[key], netWorth.baseCurrency)}</span>
              </div>
            ) : null)}

            <p className="mx-4 mb-2 mt-4 text-xs font-semibold uppercase text-gray-400">Liabilities — {formatMoney(netWorth.liabilitiesBase, netWorth.baseCurrency)}</p>
            {LIABILITY_KEYS.map((key) => netWorth.breakdown[key] > 0 ? (
              <div key={key} className="mx-4 mb-2 flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-sm text-gray-900 dark:text-white">{BREAKDOWN_LABELS[key]}</span>
                <span className="text-sm font-semibold text-danger">{formatMoney(netWorth.breakdown[key], netWorth.baseCurrency)}</span>
              </div>
            ) : null)}
          </>
        ) : null}

        {trend?.length > 1 ? (
          <>
            <p className="mx-4 mb-2 mt-4 text-xs font-semibold uppercase text-gray-400">Trend</p>
            <div className="mx-4 flex h-[100px] flex-row items-end rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:h-[140px] sm:p-6 lg:h-[180px]">
              {trend.slice(-30).map((t) => (
                <div
                  key={t.date}
                  className="mx-0.5 flex-1 rounded-t bg-primary-500"
                  style={{ height: `${Math.max(4, (Math.abs(t.netWorthBase) / maxNetWorth) * 90)}%` }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      </PageContainer>
    </Screen>
  );
}
