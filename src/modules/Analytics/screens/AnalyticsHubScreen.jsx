import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCurrentLifeScore } from '../hooks/useLifeScore';
import { useFullInsights } from '../hooks/useInsights';
import { useAnalyticsAlerts } from '../hooks/useAnalyticsAlerts';
import { LifeScoreRing } from '../components/LifeScoreRing';
import { InsightCard } from '../components/InsightCard';

const SUBSCORE_LABELS = {
  health: 'Health', productivity: 'Productivity', finance: 'Finance', career: 'Career',
  learning: 'Learning', consistency: 'Consistency', wellness: 'Wellness', growth: 'Growth', balance: 'Balance',
};

function QuickAction({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="mr-3 flex flex-col items-center" style={{ width: 78 }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950">
        <Icon name={icon} size={22} color="#2563eb" />
      </div>
      <span className="mt-1.5 text-center text-[11px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </button>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="mb-2 mt-5 flex flex-row items-center justify-between">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</p>
      {onSeeAll ? (
        <button type="button" onClick={onSeeAll} className="text-xs font-medium text-primary-600">See all</button>
      ) : null}
    </div>
  );
}

export function AnalyticsHubScreen() {
  const navigate = useNavigate();
  const { data: score, isLoading } = useCurrentLifeScore();
  const { data: insights } = useFullInsights();
  const { data: alerts } = useAnalyticsAlerts({ unreadOnly: true, limit: 5 });

  const topChanges = insights ? [...insights.topImprovements, ...insights.topDeclines].slice(0, 3) : [];

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</p>
          <div className="flex flex-row" style={{ gap: 14 }}>
            <button type="button" onClick={() => navigate('/analytics/search')} aria-label="Search">
              <Icon name="search-outline" size={24} color="#2563eb" />
            </button>
            <button type="button" onClick={() => navigate('/analytics/alerts')} aria-label="Alerts" className="relative">
              <Icon name="notifications-outline" size={24} color="#2563eb" />
              {alerts?.length > 0 ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" /> : null}
            </button>
          </div>
        </div>

        <button type="button" onClick={() => navigate('/analytics/life-score')} className="flex w-full flex-col items-center py-6">
          {isLoading ? null : <LifeScoreRing score={score?.overallScore ?? 0} size={150} strokeWidth={13} />}
        </button>

        {score?.strengths?.length > 0 ? (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Strongest: {score.strengths.map((k) => SUBSCORE_LABELS[k] ?? k).join(', ')}
          </p>
        ) : null}

        <div className="mt-5 flex flex-row overflow-x-auto pb-2">
          <QuickAction icon="grid-outline" label="Dashboards" onClick={() => navigate('/analytics/dashboards')} />
          <QuickAction icon="trending-up" label="Metrics" onClick={() => navigate('/analytics/metric-catalog')} />
          <QuickAction icon="calculator-outline" label="Custom" onClick={() => navigate('/analytics/custom-metrics')} />
          <QuickAction icon="git-network-outline" label="Correlations" onClick={() => navigate('/analytics/correlations')} />
          <QuickAction icon="bulb-outline" label="Insights" onClick={() => navigate('/analytics/insights')} />
          <QuickAction icon="document-text-outline" label="Reports" onClick={() => navigate('/analytics/reports')} />
          <QuickAction icon="notifications-outline" label="Alert Rules" onClick={() => navigate('/analytics/alert-rules')} />
          <QuickAction icon="time-outline" label="Timeline" onClick={() => navigate('/analytics/timeline')} />
          <QuickAction icon="git-commit-outline" label="Graph" onClick={() => navigate('/analytics/graph')} />
        </div>

        {topChanges.length > 0 ? (
          <>
            <SectionHeader title="Overall Insights" onSeeAll={() => navigate('/analytics/insights')} />
            {topChanges.map((m) => (
              <InsightCard key={m.key} metric={m} />
            ))}
          </>
        ) : null}

        {score ? (
          <>
            <SectionHeader title="Score Breakdown" onSeeAll={() => navigate('/analytics/life-score')} />
            {Object.entries(score.subscores).filter(([, v]) => v !== null).map(([key, value]) => (
              <div key={key} className="mb-2 flex flex-row items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                <span className="text-sm text-gray-700 dark:text-gray-300">{SUBSCORE_LABELS[key] ?? key}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}/100</span>
              </div>
            ))}
          </>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
