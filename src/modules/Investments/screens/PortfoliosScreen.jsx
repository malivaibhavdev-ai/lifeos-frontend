import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { usePortfolioList, useDeletePortfolio } from '../hooks/useInvestments';
import { PortfolioFormSheet } from '../components/PortfolioFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const PortfolioRow = memo(function PortfolioRow({ portfolio, onOpen, onDelete }) {
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(portfolio._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <button type="button" onClick={() => onOpen(portfolio)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{portfolio.name}</p>
        <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">
          {portfolio.broker || 'No broker set'} · {portfolio.costBasisMethod}
        </p>
      </button>
      <div className="ml-2 flex flex-row items-center gap-2">
        <button type="button" aria-label="Delete portfolio" onClick={() => onDelete(portfolio._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </div>
    </div>
  );
});

export function PortfoliosScreen() {
  const navigate = useNavigate();
  const { data: portfolios } = usePortfolioList();
  const deletePortfolio = useDeletePortfolio();
  const [showForm, setShowForm] = useState(false);

  const items = portfolios ?? EMPTY_ARRAY;
  const handleOpen = (portfolio) => navigate(`/finance/investments/portfolios/${portfolio._id}`);

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Investments</p>
        <button type="button" aria-label="Add portfolio" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="mx-4 mb-3 flex flex-row">
        <button type="button" onClick={() => navigate('/finance/investments/assets')} className="mr-2 flex-1 items-center rounded-xl border border-gray-200 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Assets</span>
        </button>
        <button type="button" onClick={() => navigate('/finance/investments/transactions')} className="mr-2 flex-1 items-center rounded-xl border border-gray-200 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Transactions</span>
        </button>
        <button type="button" onClick={() => navigate('/finance/investments/allocation')} className="mr-2 flex-1 items-center rounded-xl border border-gray-200 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allocation</span>
        </button>
        <button type="button" onClick={() => navigate('/finance/investments/sip-plans')} className="flex-1 items-center rounded-xl border border-gray-200 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">SIPs</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="trending-up-outline" title="No portfolios yet" description="Create a portfolio to start tracking stocks, funds, gold, crypto, and more." ctaLabel="Add Portfolio" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((portfolio) => <PortfolioRow key={portfolio._id} portfolio={portfolio} onOpen={handleOpen} onDelete={deletePortfolio.mutate} />)
        )}
      </div>
      </PageContainer>

      <PortfolioFormSheet visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
