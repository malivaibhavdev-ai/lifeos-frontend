import { memo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { usePortfolio, usePortfolioSummary, useRebalance } from '../hooks/useInvestments';
import { useFinanceSettings } from '../../Finance/hooks/useFinanceSettings';
import { formatMoney, ASSET_CLASSES } from '../../Finance/constants/financeConstants';
import { InvestmentTransactionFormSheet } from '../components/InvestmentTransactionFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const HoldingRow = memo(function HoldingRow({ holding, baseCurrency }) {
  return (
    <div className="mx-4 mb-2 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{holding.asset.symbol || holding.asset.name}</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {holding.quantity} units · {ASSET_CLASSES[holding.asset.assetClass]?.label}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {holding.marketValueBase !== null ? formatMoney(holding.marketValueBase, baseCurrency) : 'No price'}
          </span>
          {holding.unrealizedGainBase !== null ? (
            <span className={`text-xs font-semibold ${holding.unrealizedGainBase >= 0 ? 'text-success' : 'text-danger'}`}>
              {holding.unrealizedGainBase >= 0 ? '+' : ''}{formatMoney(holding.unrealizedGainBase, baseCurrency)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export function PortfolioDetailScreen() {
  const navigate = useNavigate();
  const { portfolioId } = useParams();
  const { data: portfolio } = usePortfolio(portfolioId);
  const { data: summary } = usePortfolioSummary(portfolioId);
  const { data: rebalance } = useRebalance(portfolioId);
  const { data: settings } = useFinanceSettings();
  const [showForm, setShowForm] = useState(false);

  const baseCurrency = settings?.baseCurrency ?? 'INR';
  const holdings = summary?.holdings ?? EMPTY_ARRAY;

  if (!portfolio) return null;

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{portfolio.name}</p>
        <button type="button" aria-label="Add transaction" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        <div className="mx-4 mb-4 rounded-2xl bg-primary-600 p-5">
          <p className="text-sm font-medium text-primary-100">Portfolio Value</p>
          <p className="mt-1 text-3xl font-bold text-white">{summary ? formatMoney(summary.totalValueBase, baseCurrency) : '—'}</p>
          {summary ? (
            <p className={`mt-2 text-sm font-semibold ${summary.totalUnrealizedGainBase >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {summary.totalUnrealizedGainBase >= 0 ? '+' : ''}{formatMoney(summary.totalUnrealizedGainBase, baseCurrency)} unrealized
            </p>
          ) : null}
        </div>

        <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">Holdings</p>
        {holdings.length === 0 ? (
          <p className="mx-4 text-sm text-gray-400">No holdings yet. Record a buy transaction to get started.</p>
        ) : (
          holdings.map((h) => <HoldingRow key={h.asset._id} holding={h} baseCurrency={baseCurrency} />)
        )}

        {rebalance?.actions?.length ? (
          <>
            <p className="mx-4 mb-2 mt-4 text-xs font-semibold uppercase text-gray-400">Rebalance Suggestions</p>
            {rebalance.actions.map((action) => (
              <div key={action.assetClass} className="mx-4 mb-2 flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-sm text-gray-900 dark:text-white">{ASSET_CLASSES[action.assetClass]?.label ?? action.assetClass}</span>
                <span className={`text-sm font-semibold ${action.action === 'buy' ? 'text-success' : 'text-danger'}`}>
                  {action.action === 'buy' ? 'Buy' : 'Sell'} {formatMoney(action.amountBase, baseCurrency)}
                </span>
              </div>
            ))}
          </>
        ) : null}
      </div>
      </PageContainer>

      <InvestmentTransactionFormSheet visible={showForm} onClose={() => setShowForm(false)} defaultPortfolioId={portfolioId} />
    </Screen>
  );
}
