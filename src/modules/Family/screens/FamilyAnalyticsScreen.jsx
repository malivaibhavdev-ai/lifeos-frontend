import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyScore, useFamilyGoalsOverview } from '../hooks/useFamilyAnalytics';
import { useChoreLeaderboard } from '../hooks/useChores';
import { FamilyScoreRing } from '../components/FamilyScoreRing';

const SUBSCORE_LABELS = {
  taskCompletion: 'Task Completion',
  participation: 'Participation',
  celebrations: 'Celebrations',
  goalProgress: 'Goal Progress',
  familyTime: 'Family Time',
  communication: 'Communication',
  health: 'Health Records',
};

function Bar({ label, value }) {
  if (value === null || value === undefined) return null;
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

export function FamilyAnalyticsScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: score } = useFamilyScore(householdId);
  const { data: goalsOverview } = useFamilyGoalsOverview(householdId);
  const { data: leaderboard } = useChoreLeaderboard(householdId, {});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Family Analytics</p>
        </div>

        <div className="mb-6 flex flex-col items-center rounded-2xl bg-gray-50 py-6 dark:bg-gray-900">
          <FamilyScoreRing score={score?.overallScore ?? 0} size={120} strokeWidth={10} />
          {score?.strengths?.length > 0 ? (
            <p className="mt-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
              Strongest: {score.strengths.map((k) => SUBSCORE_LABELS[k] ?? k).join(', ')}
            </p>
          ) : null}
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Score Breakdown</p>
        {score ? Object.entries(score.subscores).map(([key, value]) => <Bar key={key} label={SUBSCORE_LABELS[key] ?? key} value={value} />) : null}

        {goalsOverview ? (
          <div className="my-5 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
            <div className="flex flex-1 flex-col items-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{goalsOverview.total}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Goals</p>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{goalsOverview.averageProgress ?? 0}%</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Avg Progress</p>
            </div>
          </div>
        ) : null}

        {leaderboard?.length > 0 ? (
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Chore Leaders</p>
            {leaderboard.slice(0, 5).map((entry) => (
              <div key={entry.memberId} className="flex flex-row items-center justify-between border-b border-gray-100 py-2.5 dark:border-gray-800">
                <span className="text-sm capitalize text-gray-900 dark:text-white">{entry.name}</span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{entry.totalPoints} pts</span>
              </div>
            ))}
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
