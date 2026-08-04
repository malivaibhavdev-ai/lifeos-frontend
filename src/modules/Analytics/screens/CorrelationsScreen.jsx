import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDiscoverCorrelations, useCorrelation } from '../hooks/useCorrelation';
import { useMetricCatalog } from '../hooks/useTrend';

const STRENGTH_COLOR = { strong: '#22c55e', moderate: '#f59e0b', weak: '#94a3b8', negligible: '#94a3b8' };

function CorrelationRow({ item }) {
  const color = STRENGTH_COLOR[item.strength] ?? '#94a3b8';
  return (
    <div className="mb-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-row items-center justify-between">
        <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{item.labelA} ↔ {item.labelB}</p>
        <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${color}20` }}>
          <span className="text-xs font-semibold" style={{ color }}>{item.direction === 'negative' ? '−' : '+'}{Math.abs(item.r)}</span>
        </span>
      </div>
      <p className="mt-1 text-xs capitalize text-gray-400 dark:text-gray-500">
        {item.strength} · {item.confidence} confidence · n={item.n}
      </p>
    </div>
  );
}

export function CorrelationsScreen() {
  const navigate = useNavigate();
  const { data: discovered, isLoading } = useDiscoverCorrelations({});
  const { data: metrics } = useMetricCatalog();
  const [metricA, setMetricA] = useState(null);
  const [metricB, setMetricB] = useState(null);
  const { data: manualResult } = useCorrelation(metricA, metricB, {});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Correlations</p>
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Compare two metrics</p>
        <div className="mb-2 flex flex-row flex-wrap overflow-x-auto" style={{ gap: 8 }}>
          {(metrics ?? []).map((m) => (
            <button key={m.key} type="button" onClick={() => setMetricA(m.key)} className={`rounded-full border px-3 py-1.5 ${metricA === m.key ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs font-medium ${metricA === m.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-row flex-wrap overflow-x-auto" style={{ gap: 8 }}>
          {(metrics ?? []).map((m) => (
            <button key={m.key} type="button" onClick={() => setMetricB(m.key)} className={`rounded-full border px-3 py-1.5 ${metricB === m.key ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs font-medium ${metricB === m.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
            </button>
          ))}
        </div>
        {manualResult ? <CorrelationRow item={manualResult} /> : null}

        <p className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Automatically Discovered</p>
        {!isLoading && (discovered ?? []).length === 0 ? (
          <EmptyState icon="git-network-outline" title="Not enough data yet" description="Log more days across sleep, mood, habits, and workouts to surface correlations." />
        ) : (
          (discovered ?? []).map((item, i) => <CorrelationRow key={i} item={item} />)
        )}
      </PageContainer>
    </Screen>
  );
}
