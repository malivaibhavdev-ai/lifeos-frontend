import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyDashboard } from '../hooks/useFamily';
import { useFamilyScore } from '../hooks/useFamilyAnalytics';
import { FamilyScoreRing } from '../components/FamilyScoreRing';
import { HouseholdSetupScreen } from './HouseholdSetupScreen';

function StatTile({ icon, label, value, onClick }) {
  return (
    <button type="button" onClick={onClick} className="mr-3 w-28 flex-shrink-0 flex-col items-center rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
      <Icon name={icon} size={20} color="#2563eb" />
      <span className="mt-1.5 text-lg font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-center text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
    </button>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="mb-3 w-1/4 flex-col items-center sm:w-1/6 lg:w-[12.5%]">
      <div className="mx-auto mb-1.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950">
        <Icon name={icon} size={22} color="#2563eb" />
      </div>
      <span className="block text-center text-[11px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </button>
  );
}

export function FamilyHubScreen() {
  const navigate = useNavigate();
  const { householdId, household, isLoading: householdLoading, hasNoHousehold } = useActiveHousehold();
  const { data: dashboard, isLoading } = useFamilyDashboard(householdId);
  const { data: score } = useFamilyScore(householdId);

  if (householdLoading) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </Screen>
    );
  }

  if (hasNoHousehold) return <HouseholdSetupScreen />;

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{household?.name ?? 'Family'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{dashboard?.totalMembers ?? 0} members</p>
          </div>
          <div className="flex flex-row items-center" style={{ gap: 16 }}>
            <button type="button" onClick={() => navigate('/family/analytics')} aria-label="Analytics">
              <Icon name="stats-chart-outline" size={22} color="#64748b" />
            </button>
            <button type="button" onClick={() => navigate('/family/settings')} aria-label="Settings">
              <Icon name="settings-outline" size={22} color="#64748b" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-row items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <FamilyScoreRing score={score?.overallScore ?? 0} size={80} strokeWidth={7} />
          <div className="ml-4 flex-1">
            {score?.strengths?.length > 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Strong: {score.strengths.slice(0, 2).join(', ')}</p>
            ) : null}
            {score?.weaknesses?.length > 0 ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Focus on: {score.weaknesses.slice(0, 2).join(', ')}</p>
            ) : null}
          </div>
        </div>

        <div className="mb-2">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Quick Actions</p>
          <div className="flex flex-row flex-wrap">
            <QuickAction icon="people-outline" label="Members" onClick={() => navigate('/family/members')} />
            <QuickAction icon="git-network-outline" label="Family Tree" onClick={() => navigate('/family/tree')} />
            <QuickAction icon="checkbox-outline" label="Chores" onClick={() => navigate('/family/chores')} />
            <QuickAction icon="cart-outline" label="Shopping" onClick={() => navigate('/family/shopping-lists')} />
            <QuickAction icon="flag-outline" label="Goals" onClick={() => navigate('/family/goals')} />
            <QuickAction icon="calendar-outline" label="Events" onClick={() => navigate('/family/events')} />
            <QuickAction icon="book-outline" label="Journal" onClick={() => navigate('/family/journal')} />
            <QuickAction icon="images-outline" label="Memories" onClick={() => navigate('/family/memories')} />
            <QuickAction icon="medkit-outline" label="Medical" onClick={() => navigate('/family/medical')} />
            <QuickAction icon="alert-circle-outline" label="Emergency" onClick={() => navigate('/family/emergency')} />
            <QuickAction icon="folder-outline" label="Documents" onClick={() => navigate('/family/documents')} />
            <QuickAction icon="document-text-outline" label="Notes" onClick={() => navigate('/family/notes')} />
          </div>
        </div>

        {!isLoading && dashboard?.todaysBirthdays?.length > 0 ? (
          <div className="mb-4 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950">
            <p className="mb-1 text-sm font-semibold text-amber-700 dark:text-amber-400">🎂 Today's Birthdays</p>
            {dashboard.todaysBirthdays.map((b) => (
              <p key={b.id} className="text-sm text-amber-700 dark:text-amber-300">{b.name} turns {b.turningAge} today!</p>
            ))}
          </div>
        ) : null}

        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Upcoming</p>
          <div className="flex flex-row overflow-x-auto">
            <StatTile icon="calendar-outline" label="Events this week" value={dashboard?.upcomingEvents?.length ?? 0} onClick={() => navigate('/family/events')} />
            <StatTile icon="gift-outline" label="Birthdays (30d)" value={dashboard?.upcomingBirthdays?.length ?? 0} onClick={() => navigate('/family/members')} />
            <StatTile icon="checkbox-outline" label="Active chores" value={dashboard?.activeChoreCount ?? 0} onClick={() => navigate('/family/chores')} />
            <StatTile icon="cart-outline" label="Shopping items" value={dashboard?.pendingShoppingItemCount ?? 0} onClick={() => navigate('/family/shopping-lists')} />
          </div>
        </div>

        {dashboard?.activeGoals?.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Family Goals</p>
            {dashboard.activeGoals.map((g) => (
              <button
                key={g._id}
                type="button"
                onClick={() => navigate(`/family/goals/${g._id}`)}
                className="mb-2 block w-full rounded-2xl bg-gray-50 p-3 text-left dark:bg-gray-900"
              >
                <div className="flex flex-row items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{g.title}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{g.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${g.progress}%` }} />
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {dashboard?.todaysChores?.length > 0 ? (
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Today's Chores</p>
            {dashboard.todaysChores.map((c) => (
              <div key={c._id} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
                <div className="flex flex-row items-center">
                  <Icon name={c.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={c.status === 'completed' ? '#22c55e' : '#94a3b8'} />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">{c.chore?.title}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{c.completedBy?.name ?? ''}</span>
              </div>
            ))}
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
