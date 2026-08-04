import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { useHealthSummary } from '../hooks/useHealthHub';
import { MOOD } from '../constants/healthConstants';

function HubCard({ icon, color, title, value, subtitle, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="mb-3 flex w-[48%] sm:w-[31%] lg:w-[23%] flex-col items-start rounded-2xl bg-white p-3.5 text-left dark:bg-gray-900"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
        <Icon name={icon} size={17} color={color} />
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle ? <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p> : null}
    </button>
  );
}

export function HealthHubScreen() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useHealthSummary();

  if (isLoading || !summary) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-gray-400">Loading…</span>
        </div>
      </Screen>
    );
  }

  const waterMl = summary.water?.entries?.reduce((s, e) => s + e.amountMl, 0) ?? 0;
  const waterTarget = summary.water?.targetMl ?? 2000;
  const moodMeta = summary.mood?.mood ? MOOD[summary.mood.mood] : null;
  const pendingDoses = summary.medicineLogs?.filter((l) => l.status === 'pending').length ?? 0;
  const totalWorkoutMinutes = summary.workouts?.reduce((s, w) => s + (w.durationMinutes ?? 0), 0) ?? 0;
  const totalMeditationMinutes = summary.meditations?.reduce((s, m) => s + (m.durationMinutes ?? 0), 0) ?? 0;

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-6xl">
      <div className="px-4 pb-2 pt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Health</p>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{summary.date}</p>
      </div>

      <div className="flex flex-row flex-wrap justify-between px-4">
        <HubCard
          icon="water-outline"
          color="#3b82f6"
          title="Water"
          value={`${waterMl}ml`}
          subtitle={`of ${waterTarget}ml`}
          onPress={() => navigate('/health/water')}
        />
        <HubCard
          icon="scale-outline"
          color="#8b5cf6"
          title="Weight"
          value={summary.weight ? `${summary.weight.weightKg}kg` : '—'}
          subtitle={summary.weight ? summary.weight.date : 'No entries yet'}
          onPress={() => navigate('/health/weight')}
        />
        <HubCard
          icon="happy-outline"
          color="#f59e0b"
          title="Mood"
          value={moodMeta ? `${moodMeta.emoji} ${moodMeta.label}` : '—'}
          subtitle="Today"
          onPress={() => navigate('/health/mood')}
        />
        <HubCard
          icon="pulse-outline"
          color="#ef4444"
          title="Vitals"
          value={summary.vitals?.heartRate ? `${summary.vitals.heartRate} bpm` : '—'}
          subtitle={summary.vitals?.date ?? 'No readings yet'}
          onPress={() => navigate('/health/vitals')}
        />
        <HubCard
          icon="resize-outline"
          color="#14b8a6"
          title="Body"
          value={summary.sleepDebt ? 'Measurements' : '—'}
          subtitle="Track your body"
          onPress={() => navigate('/health/body-measurements')}
        />
        <HubCard
          icon="restaurant-outline"
          color="#22c55e"
          title="Nutrition"
          value="Meals"
          subtitle="Log what you ate"
          onPress={() => navigate('/health/nutrition')}
        />
        <HubCard
          icon="flower-outline"
          color="#a855f7"
          title="Meditation"
          value={`${totalMeditationMinutes} min`}
          subtitle="Today"
          onPress={() => navigate('/health/meditation')}
        />
        <HubCard
          icon="medkit-outline"
          color="#f97316"
          title="Medicine"
          value={pendingDoses > 0 ? `${pendingDoses} pending` : 'All clear'}
          subtitle="Today's doses"
          onPress={() => navigate('/health/medicine')}
        />
        <HubCard
          icon="moon-outline"
          color="#2563eb"
          title="Sleep"
          value={summary.sleep ? `${summary.sleep.totalHours}h` : '—'}
          subtitle={summary.sleepDebt?.debtHours ? `${summary.sleepDebt.debtHours}h debt` : 'On track'}
          onPress={() => navigate('/health/sleep-log')}
        />
        <HubCard
          icon="barbell-outline"
          color="#0ea5e9"
          title="Workout"
          value={`${totalWorkoutMinutes} min`}
          subtitle="Today"
          onPress={() => navigate('/health/workout-log')}
        />
      </div>
      </PageContainer>
    </Screen>
  );
}
