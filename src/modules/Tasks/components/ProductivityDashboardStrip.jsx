import { useMemo } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useTaskTodaySummary } from '../hooks/useTasks';
import { useFocusStats } from '../../Focus/hooks/useFocusSessions';

function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

function StatChip({ icon, iconColor, label, value }) {
  return (
    <div
      className="mr-2 flex-shrink-0 rounded-2xl bg-gray-50 px-3.5 py-2.5 dark:bg-gray-900 lg:mr-0 lg:min-w-0 lg:flex-1"
      style={{ minWidth: 92 }}
    >
      <div className="flex flex-row items-center justify-between">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
        <Icon name={icon} size={15} color={iconColor} />
      </div>
      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

// Shown above every workspace view (List/Board/Calendar/Matrix/Timeline) —
// a single shared glance at today, not a full analytics dashboard (that's
// its own future phase). The "Productivity Score" here is a plain,
// documented ratio (completed / total due today), not a modeled or
// AI-derived figure — it's presented as exactly what it is.
export function ProductivityDashboardStrip() {
  const { data: summary } = useTaskTodaySummary();

  const { from, to } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);
  const { data: focusStats } = useFocusStats(from, to);

  const totalToday = summary?.totalToday ?? 0;
  const completedToday = summary?.completedToday ?? 0;
  const remainingToday = summary?.remainingToday ?? 0;
  const estimatedMinutesToday = summary?.estimatedMinutesToday ?? 0;
  const focusMinutes = (focusStats?.totalFocusSeconds ?? 0) / 60;
  const productivityScore = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : null;

  return (
    // Fixed-width chips in a horizontal scroller read fine on a phone-width
    // viewport, but on desktop they'd bunch to the left and leave a large
    // empty gap on the right — at `lg:` they switch to flexible chips that
    // spread out and fill the row's actual width instead.
    <div className="mb-2.5 h-[62px] overflow-x-auto lg:h-auto lg:overflow-visible">
      <div className="flex h-[62px] flex-row items-center px-4 lg:h-auto lg:gap-2.5">
        <StatChip icon="today-outline" iconColor="#2563eb" label="Today" value={totalToday} />
        <StatChip icon="checkmark-done-outline" iconColor="#22c55e" label="Completed" value={completedToday} />
        <StatChip icon="ellipse-outline" iconColor="#f59e0b" label="Remaining" value={remainingToday} />
        <StatChip icon="flame-outline" iconColor="#ef4444" label="Focus Time" value={formatMinutes(focusMinutes)} />
        <StatChip icon="hourglass-outline" iconColor="#8b5cf6" label="Estimated" value={formatMinutes(estimatedMinutesToday)} />
        <StatChip
          icon="trending-up-outline"
          iconColor="#22c55e"
          label="Productivity"
          value={productivityScore == null ? '—' : `${productivityScore}%`}
        />
      </div>
    </div>
  );
}
