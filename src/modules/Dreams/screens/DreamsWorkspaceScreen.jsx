import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDreamList, useDreamOverview, useDreamScore } from '../hooks/useDreams';
import { DreamCard } from '../components/DreamCard';
import { DreamScoreRing } from '../components/DreamScoreRing';
import { useDreamUiStore } from '../store/dreamUiStore';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'all', label: 'All Dreams' },
];

function StatBlock({ label, value }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function HeaderIconButton({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="ml-3">
      <Icon name={icon} size={22} color="#64748b" />
    </button>
  );
}

export function DreamsWorkspaceScreen() {
  const navigate = useNavigate();
  const activeTab = useDreamUiStore((s) => s.activeTab);
  const setActiveTab = useDreamUiStore((s) => s.setActiveTab);

  const { data: dreamsData, isLoading } = useDreamList({ limit: 20 });
  const dreams = dreamsData ?? [];
  const { data: overview } = useDreamOverview({});
  const { data: score } = useDreamScore();

  const handleOpenDream = (dream) => navigate(`/dreams/${dream._id}`);
  const handleNewDream = () => navigate('/dreams/new');

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Dreams</p>
          <div className="flex flex-row items-center">
            <HeaderIconButton icon="calendar-outline" label="Calendar" onClick={() => navigate('/dreams/calendar')} />
            <HeaderIconButton icon="stats-chart-outline" label="Analytics" onClick={() => navigate('/dreams/analytics')} />
            <HeaderIconButton icon="settings-outline" label="Settings" onClick={() => navigate('/dreams/settings')} />
            <button
              type="button"
              onClick={handleNewDream}
              aria-label="New dream"
              className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-600"
            >
              <Icon name="add" size={20} color="#fff" />
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 items-center rounded-lg py-1.5 ${activeTab === tab.key ? 'bg-white dark:bg-gray-800' : ''}`}
            >
              <span className={`text-xs font-semibold ${activeTab === tab.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' ? (
          <div>
            <div className="mb-4 flex flex-row items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <DreamScoreRing score={score?.overallScore ?? 0} size={80} strokeWidth={7} />
              <div className="ml-4 flex flex-1 flex-row">
                <StatBlock label="Dream Streak" value={overview?.dreamStreak?.currentStreak ?? 0} />
                <StatBlock label="Lucid Dreams" value={overview?.lucidCount ?? 0} />
                <StatBlock label="Nightmares" value={overview?.nightmareCount ?? 0} />
              </div>
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Recent Dreams</p>

            {!isLoading && dreams.length === 0 ? (
              <EmptyState
                icon="moon-outline"
                title="No dreams recorded yet"
                description="Log a dream as soon as you wake up, while it's still fresh."
                ctaLabel="Record a dream"
                onCtaPress={handleNewDream}
              />
            ) : (
              dreams.slice(0, 5).map((dream) => <DreamCard key={dream._id} dream={dream} onPress={handleOpenDream} />)
            )}
          </div>
        ) : !isLoading && dreams.length === 0 ? (
          <EmptyState
            icon="moon-outline"
            title="No dreams recorded yet"
            description="Log a dream as soon as you wake up, while it's still fresh."
            ctaLabel="Record a dream"
            onCtaPress={handleNewDream}
          />
        ) : (
          dreams.map((dream) => <DreamCard key={dream._id} dream={dream} onPress={handleOpenDream} />)
        )}
      </PageContainer>
    </Screen>
  );
}
