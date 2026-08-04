import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useEvaluateCustomMetric, useDeleteCustomMetric } from '../hooks/useCustomMetrics';
import { LineChart } from '../components/LineChart';

export function CustomMetricDetailScreen() {
  const navigate = useNavigate();
  const { metricId } = useParams();
  const location = useLocation();
  const name = location.state?.name;
  const { data: result, isLoading } = useEvaluateCustomMetric(metricId, {});
  const deleteMetric = useDeleteCustomMetric();

  const handleDelete = () => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    deleteMetric.mutate(metricId);
    navigate(-1);
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{name}</p>
          <button type="button" onClick={handleDelete} aria-label="Delete metric">
            <Icon name="trash-outline" size={20} color="#ef4444" />
          </button>
        </div>

        {!isLoading && result ? (
          <>
            <div className="flex flex-col items-center py-6">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{result.value ?? '—'}</p>
              {result.unit ? <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{result.unit}</p> : null}
              {result.progressToTarget !== null ? (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{result.progressToTarget}% of target ({result.targetValue})</p>
              ) : null}
            </div>
            <LineChart data={result.series} showArea />
          </>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
