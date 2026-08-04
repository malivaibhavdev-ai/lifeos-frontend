import { useTrend } from '../hooks/useTrend';
import { useCurrentLifeScore } from '../hooks/useLifeScore';
import { useFullInsights } from '../hooks/useInsights';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { CalendarHeatmap } from './CalendarHeatmap';
import { RadarChart } from './RadarChart';
import { Sparkline } from './Sparkline';
import { LifeScoreRing } from './LifeScoreRing';
import { InsightCard } from './InsightCard';

const SUBSCORE_LABELS = {
  health: 'Health', productivity: 'Productivity', finance: 'Finance', career: 'Career',
  learning: 'Learning', consistency: 'Consistency', wellness: 'Wellness', growth: 'Growth', balance: 'Balance',
};

function Loading() {
  return (
    <div className="flex items-center justify-center py-8">
      <span className="text-xs text-gray-400 dark:text-gray-500">Loading…</span>
    </div>
  );
}

function MetricWidget({ widget }) {
  const metricKey = widget.metricKeys?.[0];
  const { data: trend, isLoading } = useTrend(metricKey, {});
  if (isLoading || !trend) return <Loading />;

  switch (widget.type) {
    case 'bar':
    case 'stackedBar':
      return <BarChart data={trend.series} />;
    case 'heatmap':
      return <CalendarHeatmap data={trend.series} />;
    case 'sparkline':
      return <Sparkline data={trend.series} />;
    case 'kpi':
    case 'gauge': {
      const latest = [...trend.series].reverse().find((p) => p.value !== null)?.value ?? null;
      return (
        <div className="flex flex-col items-center py-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{latest ?? '—'}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{trend.unit}</p>
        </div>
      );
    }
    case 'area':
      return <LineChart data={trend.series} showArea />;
    case 'line':
    default:
      return <LineChart data={trend.series} showArea={false} />;
  }
}

function LifeScoreWidget() {
  const { data: score, isLoading } = useCurrentLifeScore();
  if (isLoading || !score) return <Loading />;
  return (
    <div className="flex items-center justify-center py-2">
      <LifeScoreRing score={score.overallScore} size={110} strokeWidth={9} />
    </div>
  );
}

function LifeWheelWidget() {
  const { data: score, isLoading } = useCurrentLifeScore();
  if (isLoading || !score) return <Loading />;
  const axes = Object.entries(score.subscores)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => ({ key, label: SUBSCORE_LABELS[key] ?? key, value }));
  return <RadarChart axes={axes} size={220} />;
}

function InsightListWidget() {
  const { data: insights, isLoading } = useFullInsights();
  if (isLoading || !insights) return <Loading />;
  const combined = [...insights.topImprovements, ...insights.topDeclines].slice(0, 5);
  if (combined.length === 0) {
    return <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">No significant changes yet</p>;
  }
  return (
    <div>
      {combined.map((m) => (
        <InsightCard key={m.key} metric={m} />
      ))}
    </div>
  );
}

export function WidgetRenderer({ widget }) {
  switch (widget.type) {
    case 'lifeScore':
      return <LifeScoreWidget />;
    case 'radar':
      return <LifeWheelWidget />;
    case 'insightList':
      return <InsightListWidget />;
    default:
      return <MetricWidget widget={widget} />;
  }
}
