import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCurrentLifeScore, useLifeScoreHistory } from '../hooks/useLifeScore';
import { LifeScoreRing } from '../components/LifeScoreRing';
import { LineChart } from '../components/LineChart';

const SUBSCORE_LABELS = {
  health: 'Health', productivity: 'Productivity', finance: 'Finance', career: 'Career',
  learning: 'Learning', consistency: 'Consistency', wellness: 'Wellness', growth: 'Growth', balance: 'Balance',
};

function Bar({ label, value }) {
  if (value === null || value === undefined) {
    return (
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label} — no data yet</p>
      </div>
    );
  }
  return (
    <div className="mb-3">
      <div className="mb-1 flex flex-row items-center justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-xs font-semibold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-2 rounded-full bg-primary-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function LifeScoreScreen() {
  const navigate = useNavigate();
  const { data: score } = useCurrentLifeScore();
  const { data: history } = useLifeScoreHistory({});

  const historySeries = (history ?? []).map((h) => ({ date: h.date, value: h.overallScore }));

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Life Score</p>
        </div>

        <div className="flex flex-col items-center py-6">
          <LifeScoreRing score={score?.overallScore ?? 0} size={160} strokeWidth={14} />
        </div>

        {historySeries.length > 1 ? (
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">History</p>
            <LineChart data={historySeries} color="#7c3aed" showArea />
          </div>
        ) : null}

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Score Breakdown</p>
        {score ? Object.entries(score.subscores).map(([key, value]) => <Bar key={key} label={SUBSCORE_LABELS[key] ?? key} value={value} />) : null}

        {score?.strengths?.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-green-50 p-4 dark:bg-green-950">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Strengths</p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {score.strengths.map((k) => SUBSCORE_LABELS[k] ?? k).join(', ')}
            </p>
          </div>
        ) : null}

        {score?.weaknesses?.length > 0 ? (
          <div className="mt-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Areas to improve</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {score.weaknesses.map((k) => SUBSCORE_LABELS[k] ?? k).join(', ')}
            </p>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
