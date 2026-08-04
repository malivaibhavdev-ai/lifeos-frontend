import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCustomMetrics, useDeleteCustomMetric } from '../hooks/useCustomMetrics';

export function CustomMetricsScreen() {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useCustomMetrics();
  const deleteMetric = useDeleteCustomMetric();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Custom Metrics</p>
          <button type="button" onClick={() => navigate('/analytics/custom-metrics/new')} aria-label="New metric">
            <Icon name="add" size={24} color="#2563eb" />
          </button>
        </div>

        {!isLoading && (metrics ?? []).length === 0 ? (
          <EmptyState
            icon="calculator-outline"
            title="No custom metrics yet"
            description="Build your own KPI from any registered metric — e.g. weekly deep-work hours."
            ctaLabel="New metric"
            onCtaPress={() => navigate('/analytics/custom-metrics/new')}
          />
        ) : (
          (metrics ?? []).map((metric) => (
            <div key={metric._id} className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => navigate(`/analytics/custom-metrics/${metric._id}`, { state: { name: metric.name } })}
                className="flex-1 text-left"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{metric.name}</p>
                <p className="mt-0.5 text-xs capitalize text-gray-400 dark:text-gray-500">{metric.aggregation} of {metric.baseMetricKey}</p>
              </button>
              <button type="button" onClick={() => deleteMetric.mutate(metric._id)} aria-label="Delete metric">
                <Icon name="trash-outline" size={18} color="#94a3b8" />
              </button>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
