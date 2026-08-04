import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useMetricCatalog } from '../hooks/useTrend';

const CATEGORY_ICON = {
  health: 'fitness-outline', wellness: 'happy-outline', productivity: 'checkbox-outline',
  finance: 'cash-outline', career: 'briefcase-outline', growth: 'trending-up',
  consistency: 'flame-outline', learning: 'book-outline', organization: 'folder-outline',
};

export function MetricCatalogScreen() {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useMetricCatalog();

  const byCategory = {};
  for (const m of metrics ?? []) {
    (byCategory[m.category] ??= []).push(m);
  }

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Metric Catalog</p>
        </div>

        {!isLoading && Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="mb-5">
            <p className="mb-2 text-sm font-semibold capitalize uppercase tracking-wide text-gray-400 dark:text-gray-500">{category}</p>
            {items.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => navigate(`/analytics/metrics/${metric.key}`, { state: { label: metric.label } })}
                className="mb-2 flex w-full flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-row items-center">
                  <Icon name={CATEGORY_ICON[metric.category] ?? 'analytics-outline'} size={18} color="#2563eb" />
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{metric.label}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{metric.unit}</span>
              </button>
            ))}
          </div>
        ))}
      </PageContainer>
    </Screen>
  );
}
