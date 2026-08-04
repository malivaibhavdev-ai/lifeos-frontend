import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCreateWidget } from '../hooks/useDashboards';
import { useMetricCatalog } from '../hooks/useTrend';
import { WIDGET_TYPES, TIME_RANGE_PRESETS } from '../constants/analyticsConstants';

const WIDGET_TYPE_LABELS = {
  line: 'Line Chart', bar: 'Bar Chart', stackedBar: 'Stacked Bar', area: 'Area Chart', pie: 'Pie Chart',
  radar: 'Life Wheel', heatmap: 'Heatmap', scatter: 'Scatter', gauge: 'Gauge', sparkline: 'Sparkline',
  kpi: 'KPI Number', table: 'Table', insightList: 'Insight List', lifeScore: 'Life Score', correlation: 'Correlation', timeline: 'Timeline',
};

const NO_METRIC_TYPES = new Set(['lifeScore', 'radar', 'insightList']);

export function WidgetFormScreen() {
  const navigate = useNavigate();
  const { dashboardId } = useParams();
  const { data: metrics } = useMetricCatalog();
  const createWidget = useCreateWidget(dashboardId);

  const [type, setType] = useState('line');
  const [title, setTitle] = useState('');
  const [metricKey, setMetricKey] = useState(null);
  const [timeRangePreset, setTimeRangePreset] = useState('30d');
  const [error, setError] = useState(null);

  const needsMetric = !NO_METRIC_TYPES.has(type);

  const handleSubmit = () => {
    if (!title.trim()) return setError('Title is required');
    if (needsMetric && !metricKey) return setError('Choose a metric for this widget');
    createWidget.mutate(
      { type, title: title.trim(), metricKeys: needsMetric ? [metricKey] : [], timeRangePreset },
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
          <p className="text-lg font-bold text-gray-900 dark:text-white">New Widget</p>
          <button type="button" onClick={handleSubmit}>
            <span className="text-base font-semibold text-primary-600">Save</span>
          </button>
        </div>

        <ErrorBanner message={error} />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Widget title *"
          className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Chart Type</p>
        <div className="mb-5 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {WIDGET_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`rounded-full border px-3.5 py-2 ${type === t ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{WIDGET_TYPE_LABELS[t]}</span>
            </button>
          ))}
        </div>

        {needsMetric ? (
          <>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Metric</p>
            <div className="mb-5 flex flex-row flex-wrap" style={{ gap: 8 }}>
              {(metrics ?? []).map((m) => (
                <button key={m.key} type="button" onClick={() => setMetricKey(m.key)} className={`rounded-full border px-3.5 py-2 ${metricKey === m.key ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className={`text-sm font-medium ${metricKey === m.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Time Range</p>
        <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
          {TIME_RANGE_PRESETS.filter((p) => p !== 'custom').map((preset) => (
            <button key={preset} type="button" onClick={() => setTimeRangePreset(preset)} className={`rounded-full border px-3.5 py-2 ${timeRangePreset === preset ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium uppercase ${timeRangePreset === preset ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{preset}</span>
            </button>
          ))}
        </div>
      </PageContainer>
    </Screen>
  );
}
