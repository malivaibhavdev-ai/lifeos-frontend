import { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useFocusSessionHistory, useFocusStats } from '../hooks/useFocusSessions';
import { FOCUS_MODE_PRESETS } from '../constants/focusModes';

const STATUS_META = {
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-circle' },
  interrupted: { label: 'Interrupted', color: '#f59e0b', icon: 'alert-circle' },
  active: { label: 'Active', color: '#2563eb', icon: 'ellipse' },
};

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

function StatBlock({ label, value }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

const SessionRow = memo(function SessionRow({ session }) {
  const preset = FOCUS_MODE_PRESETS[session.mode];
  const statusMeta = STATUS_META[session.status] ?? STATUS_META.completed;

  return (
    <div className="flex flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
        <Icon name={preset?.icon ?? 'timer-outline'} size={18} color="#2563eb" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{preset?.label ?? session.mode}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {dayjs(session.startedAt).format('MMM D · h:mm A')}
          {session.pauseCount > 0 ? ` · ${session.pauseCount} pause${session.pauseCount > 1 ? 's' : ''}` : ''}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatDuration(session.actualDurationSeconds)}
        </p>
        <div className="mt-0.5 flex flex-row items-center">
          <Icon name={statusMeta.icon} size={11} color={statusMeta.color} />
          <span className="ml-1 text-xs" style={{ color: statusMeta.color }}>
            {statusMeta.label}
          </span>
        </div>
      </div>
    </div>
  );
});

// Session list + aggregate stats for the last 30 days — a simple, honest
// window rather than an open-ended "all time" query, matching the same
// bounded-range pattern statsForRange already uses for the dashboard strip.
export function FocusHistoryScreen() {
  const { from, to } = useMemo(() => {
    const end = dayjs().endOf('day');
    const start = end.subtract(30, 'day').startOf('day');
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);

  const { data: stats } = useFocusStats(from, to);
  const { data, isLoading } = useFocusSessionHistory({ limit: 50 });
  const sessions = data?.items ?? EMPTY_ARRAY;

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4 dark:border-gray-800">
          <StatBlock label="Focus Time" value={formatDuration(stats?.totalFocusSeconds ?? 0)} />
          <StatBlock label="Sessions" value={stats?.sessionCount ?? 0} />
          <StatBlock label="Completed" value={stats?.completedCount ?? 0} />
        </div>

        {!isLoading && sessions.length === 0 ? (
          <EmptyState
            icon="timer-outline"
            title="No focus sessions yet"
            description="Start a focus session and it'll show up here."
          />
        ) : (
          <div>
            {sessions.map((session) => (
              <SessionRow key={session._id} session={session} />
            ))}
          </div>
        )}
      </PageContainer>
    </Screen>
  );
}
