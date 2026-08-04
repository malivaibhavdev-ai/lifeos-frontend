import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCreateCustomMetric } from '../hooks/useCustomMetrics';
import { useMetricCatalog } from '../hooks/useTrend';
import { AGGREGATIONS } from '../constants/analyticsConstants';

export function CustomMetricFormScreen() {
  const navigate = useNavigate();
  const { data: metrics } = useMetricCatalog();
  const createMetric = useCreateCustomMetric();

  const [name, setName] = useState('');
  const [baseMetricKey, setBaseMetricKey] = useState(null);
  const [aggregation, setAggregation] = useState('average');
  const [targetValue, setTargetValue] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (!name.trim()) return setError('Name is required');
    if (!baseMetricKey) return setError('Choose a base metric');
    createMetric.mutate(
      { name: name.trim(), baseMetricKey, aggregation, targetValue: targetValue.trim() ? Number(targetValue.trim()) : null },
      { onSuccess: () => navigate(-1), onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Cancel">
            <Icon name="close" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">New Custom Metric</p>
          <button type="button" onClick={handleSubmit}>
            <span className="text-base font-semibold text-primary-600">Save</span>
          </button>
        </div>

        <ErrorBanner message={error} />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Metric name *"
          className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Base Metric</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {(metrics ?? []).map((m) => (
            <button key={m.key} type="button" onClick={() => setBaseMetricKey(m.key)} className={`rounded-full border px-3.5 py-2 ${baseMetricKey === m.key ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${baseMetricKey === m.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Aggregation</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {AGGREGATIONS.map((agg) => (
            <button key={agg} type="button" onClick={() => setAggregation(agg)} className={`rounded-full border px-3.5 py-2 ${aggregation === agg ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${aggregation === agg ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{agg}</span>
            </button>
          ))}
        </div>

        <input
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="Target value (optional)"
          type="number"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
      </PageContainer>
    </Screen>
  );
}
