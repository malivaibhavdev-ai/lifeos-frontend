import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCreateAlertRule } from '../hooks/useAnalyticsAlerts';
import { useMetricCatalog } from '../hooks/useTrend';
import { ALERT_CONDITIONS } from '../constants/analyticsConstants';

const CONDITION_LABELS = {
  below: 'Falls below', above: 'Rises above', dropped_by_percent: 'Drops by %', rose_by_percent: 'Rises by %', streak_broken: 'Streak breaks',
};

export function AlertRuleFormScreen() {
  const navigate = useNavigate();
  const { data: metrics } = useMetricCatalog();
  const createRule = useCreateAlertRule();

  const [name, setName] = useState('');
  const [metricKey, setMetricKey] = useState(null);
  const [condition, setCondition] = useState('below');
  const [threshold, setThreshold] = useState('');
  const [error, setError] = useState(null);

  const needsThreshold = condition !== 'streak_broken';

  const handleSubmit = () => {
    if (!name.trim()) return setError('Name is required');
    if (!metricKey) return setError('Choose a metric');
    if (needsThreshold && !threshold.trim()) return setError('Threshold is required for this condition');
    createRule.mutate(
      { name: name.trim(), metricKey, condition, threshold: needsThreshold ? Number(threshold.trim()) : null },
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
          <p className="text-lg font-bold text-gray-900 dark:text-white">New Alert Rule</p>
          <button type="button" onClick={handleSubmit}>
            <span className="text-base font-semibold text-primary-600">Save</span>
          </button>
        </div>

        <ErrorBanner message={error} />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rule name *"
          className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Metric</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {(metrics ?? []).map((m) => (
            <button key={m.key} type="button" onClick={() => setMetricKey(m.key)} className={`rounded-full border px-3.5 py-2 ${metricKey === m.key ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${metricKey === m.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Condition</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {ALERT_CONDITIONS.map((c) => (
            <button key={c} type="button" onClick={() => setCondition(c)} className={`rounded-full border px-3.5 py-2 ${condition === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${condition === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{CONDITION_LABELS[c]}</span>
            </button>
          ))}
        </div>

        {needsThreshold ? (
          <input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Threshold value *"
            type="number"
            className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
          />
        ) : null}
      </PageContainer>
    </Screen>
  );
}
