import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useHabit, useHabitHeatmap, useHabitStatistics, useHabitStreaks, useLogHabitEntry, useSetHabitFrozen } from '../hooks/useHabits';
import { useFocusSessionHistory } from '../../Focus/hooks/useFocusSessions';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { HabitFormSheet } from '../components/HabitFormSheet';
import { HABIT_TYPE, TRACKING_TYPE } from '../constants/habitConstants';

const ZOOM_RANGES = {
  week: { label: 'Week', days: 7 },
  month: { label: 'Month', days: 30 },
  year: { label: 'Year', days: 365 },
};

function StatBlock({ label, value }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function HabitDetailScreen() {
  const navigate = useNavigate();
  const { habitId } = useParams();
  const [zoom, setZoom] = useState('month');
  const [showEdit, setShowEdit] = useState(false);

  const { data: habit } = useHabit(habitId);
  const { data: streaks } = useHabitStreaks(habitId);

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const range = useMemo(() => {
    const days = ZOOM_RANGES[zoom].days;
    return { from: dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD'), to: today };
  }, [zoom, today]);

  const { data: heatmap } = useHabitHeatmap(habitId, range);
  const { data: statistics } = useHabitStatistics(habitId, range);

  const setFrozen = useSetHabitFrozen();
  const logEntry = useLogHabitEntry();

  const { data: recentSessions } = useFocusSessionHistory({ entityType: 'habit', entityId: habitId, status: 'completed', limit: 1 });
  const lastSession = recentSessions?.items?.[0];

  if (!habit) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
            role="status"
            aria-label="Loading"
          />
        </div>
      </Screen>
    );
  }

  const typeMeta = HABIT_TYPE[habit.type] ?? HABIT_TYPE.build;
  const trackingMeta = TRACKING_TYPE[habit.trackingType] ?? TRACKING_TYPE.boolean;
  const color = habit.color ?? '#2563eb';

  const handleLogFromFocusSession = () => {
    if (!lastSession) return;
    const minutes = Math.round(lastSession.actualDurationSeconds / 60);
    logEntry.mutate({ id: habitId, date: today, value: minutes, note: 'From Focus session' });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
      <div className="flex flex-row items-center justify-between pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <button type="button" onClick={() => setShowEdit(true)} aria-label="Edit habit">
          <Icon name="create-outline" size={22} color="#64748b" />
        </button>
      </div>

      <div>
        <div className="flex flex-row items-center">
          {habit.emoji ? (
            <span className="text-3xl">{habit.emoji}</span>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}26` }}>
              <Icon name={typeMeta.icon} size={20} color={color} />
            </div>
          )}
          <div className="ml-3 flex-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{habit.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {typeMeta.label} · {trackingMeta.label}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
          <StatBlock label="Current Streak" value={streaks?.currentStreak ?? 0} />
          <StatBlock label="Best Streak" value={streaks?.bestStreak ?? 0} />
          <StatBlock label="Consistency" value={statistics ? `${statistics.consistencyScore}%` : '—'} />
        </div>

        <div className="mt-5 flex flex-row items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Heatmap</p>
          <div className="flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
            {Object.keys(ZOOM_RANGES).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => setZoom(key)}
                className={`rounded-lg px-3 py-1 ${zoom === key ? 'bg-white dark:bg-gray-800' : ''}`}
              >
                <span className={`text-xs font-semibold ${zoom === key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {ZOOM_RANGES[key].label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3">{heatmap ? <HeatmapGrid data={heatmap} color={color} /> : null}</div>

        {statistics ? (
          <div className="mt-6 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Statistics</p>
            <div className="flex flex-row flex-wrap">
              <div className="mb-3 w-1/2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{statistics.completionRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</p>
              </div>
              <div className="mb-3 w-1/2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{statistics.missedRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Missed Rate</p>
              </div>
              <div className="w-1/2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {statistics.averageCompletionMinutes != null
                    ? `${String(Math.floor(statistics.averageCompletionMinutes / 60)).padStart(2, '0')}:${String(statistics.averageCompletionMinutes % 60).padStart(2, '0')}`
                    : '—'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Completion Time</p>
              </div>
              <div className="w-1/2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {statistics.completedCount}/{statistics.totalScheduled}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Days Completed</p>
              </div>
            </div>
          </div>
        ) : null}

        {habit.freezeCreditsTotal > 0 ? (
          <button
            type="button"
            onClick={() => setFrozen.mutate({ id: habitId, date: today, isFrozen: true })}
            className="mt-4 flex w-full flex-row items-center justify-center rounded-xl bg-blue-50 py-3 dark:bg-blue-950"
          >
            <Icon name="snow-outline" size={16} color="#3b82f6" />
            <span className="ml-2 text-sm font-semibold text-blue-600">Freeze Today</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => navigate('/focus', { state: { entityType: 'habit', entityId: habitId, taskTitle: habit.name } })}
          className="mt-3 flex w-full flex-row items-center justify-center rounded-xl bg-primary-600 py-3"
        >
          <Icon name="timer-outline" size={16} color="#fff" />
          <span className="ml-2 text-sm font-semibold text-white">Start Focus Session</span>
        </button>

        {lastSession && habit.trackingType !== 'boolean' ? (
          <button
            type="button"
            onClick={handleLogFromFocusSession}
            className="mb-6 mt-3 flex w-full flex-row items-center justify-center rounded-xl bg-primary-50 py-3 dark:bg-primary-950"
          >
            <Icon name="add-circle-outline" size={16} color="#2563eb" />
            <span className="ml-2 text-sm font-semibold text-primary-600">
              Log {Math.round(lastSession.actualDurationSeconds / 60)} min from last Focus session
            </span>
          </button>
        ) : (
          <div className="mb-6" />
        )}
      </div>
      </PageContainer>

      <HabitFormSheet visible={showEdit} onClose={() => setShowEdit(false)} habit={habit} />
    </Screen>
  );
}
