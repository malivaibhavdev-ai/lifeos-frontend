import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useFullInsights } from '../hooks/useInsights';
import { InsightCard } from '../components/InsightCard';

export function InsightsScreen() {
  const navigate = useNavigate();
  const { data: insights, isLoading } = useFullInsights();

  const hasAny = insights && (insights.topImprovements.length || insights.topDeclines.length || insights.streakBreaks.length || insights.burnoutRisk);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Insights</p>
        </div>

        {!isLoading && !hasAny ? (
          <EmptyState icon="bulb-outline" title="No significant changes yet" description="Insights appear once there's at least two comparable periods of data." />
        ) : (
          <>
            {insights?.burnoutRisk ? (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 dark:bg-red-950">
                <div className="flex flex-row items-center">
                  <Icon name="alert-circle-outline" size={18} color="#ef4444" />
                  <p className="ml-2 text-sm font-semibold capitalize text-red-700 dark:text-red-400">{insights.burnoutRisk.riskLevel} burnout risk</p>
                </div>
                <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                  Rising stress, falling sleep, and/or falling focus are trending together.
                </p>
              </div>
            ) : null}

            {insights?.streakBreaks?.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Streaks Broken</p>
                {insights.streakBreaks.map((brk) => (
                  <div key={brk.habitId} className="mb-2 flex flex-row items-center rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                    <Icon name="flame-outline" size={16} color="#f59e0b" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {brk.habitName} — {brk.brokenStreakLength}-day streak ended
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {insights?.topImprovements?.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Top Improvements</p>
                {insights.topImprovements.map((m) => <InsightCard key={m.key} metric={m} />)}
              </div>
            ) : null}

            {insights?.topDeclines?.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Top Declines</p>
                {insights.topDeclines.map((m) => <InsightCard key={m.key} metric={m} />)}
              </div>
            ) : null}
          </>
        )}
      </PageContainer>
    </Screen>
  );
}
