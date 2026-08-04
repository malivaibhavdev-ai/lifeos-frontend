import { memo } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { impactAsync, ImpactFeedbackStyle } from '../../../services/haptics';
import { useHabitLogs, useHabitStreaks, useLogHabitEntry, useSetHabitCompleted } from '../hooks/useHabits';
import { ProgressRing } from './ProgressRing';
import { HABIT_TYPE } from '../constants/habitConstants';

// Web replacement for the mobile card's Swipeable (swipe-right-to-archive —
// the only swipe action a Habit card has, and swiping fully open *is* the
// trigger, no confirm tap). That single action now lives as a hover-revealed
// trailing icon button (`group-hover`, same idiom as Tasks' TaskListItem),
// always shown on touch/narrow viewports where hover doesn't exist.
// `swipeEnabled` simply omits the affordance (e.g. read-only inside
// RoutineDetailScreen).
// Memoized: rendered in `.map()` loops on the workspace/routine-detail
// lists — callers must pass stable (useCallback'd) onPress/onLongPress/
// onArchive handlers for this to actually skip re-renders.
export const HabitCard = memo(function HabitCard({ habit, date, onPress, onLongPress, onArchive, swipeEnabled = true }) {
  const { data: logs } = useHabitLogs(habit._id, { from: date, to: date });
  const { data: streaks } = useHabitStreaks(habit._id);
  const streak = streaks?.currentStreak ?? 0;
  const log = logs?.[0];
  const setCompleted = useSetHabitCompleted();
  const logEntry = useLogHabitEntry();

  const isCompleted = Boolean(log?.completed);
  const totalValue = log?.totalValue ?? 0;
  const targetValue = habit.targetValue || 1;
  const progress = habit.trackingType === 'boolean' ? (isCompleted ? 1 : 0) : Math.min(totalValue / targetValue, 1);
  const color = habit.color ?? '#2563eb';
  const typeMeta = HABIT_TYPE[habit.type] ?? HABIT_TYPE.build;

  const handleQuickAction = (e) => {
    e.stopPropagation();
    impactAsync(ImpactFeedbackStyle.Medium);
    if (habit.trackingType === 'boolean') {
      setCompleted.mutate({ id: habit._id, date, completed: !isCompleted });
    } else {
      const step = Math.max(1, Math.round(targetValue / 4));
      logEntry.mutate({ id: habit._id, date, value: step });
    }
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    impactAsync(ImpactFeedbackStyle.Medium);
    onArchive?.(habit);
  };

  return (
    <div className="group relative mx-4 mb-2.5">
      <div
        className={`flex flex-row items-center rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900 ${isCompleted ? 'opacity-70' : ''}`}
      >
        <button type="button" onClick={handleQuickAction} aria-label="Quick log" className="shrink-0">
          <ProgressRing size={44} strokeWidth={3.5} progress={progress} color={color}>
            {habit.emoji ? (
              <span className="text-lg">{habit.emoji}</span>
            ) : (
              <Icon name={isCompleted ? 'checkmark' : typeMeta.icon} size={18} color={isCompleted ? color : '#94a3b8'} />
            )}
          </ProgressRing>
        </button>

        <button
          type="button"
          onClick={() => onPress?.(habit)}
          onContextMenu={(e) => {
            e.preventDefault();
            onLongPress?.(habit);
          }}
          aria-label={habit.name}
          className="ml-3 min-w-0 flex-1 text-left"
        >
          <p className={`truncate text-base font-semibold text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>
            {habit.name}
          </p>
          <div className="mt-0.5 flex flex-row items-center">
            {habit.trackingType !== 'boolean' ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {totalValue}/{targetValue} {habit.unit ?? ''}
              </span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">{typeMeta.label}</span>
            )}
            {streak > 0 ? (
              <span className="ml-2 flex flex-row items-center">
                <Icon name="flame" size={11} color="#f59e0b" />
                <span className="ml-0.5 text-xs font-medium text-amber-600">{streak}</span>
              </span>
            ) : null}
          </div>
        </button>

        {habit.trackingType !== 'boolean' ? (
          <button
            type="button"
            onClick={handleQuickAction}
            aria-label="Add"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950"
          >
            <Icon name="add" size={18} color={color} />
          </button>
        ) : null}

        {swipeEnabled ? (
          <button
            type="button"
            onClick={handleArchive}
            aria-label="Archive habit"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100 dark:bg-gray-800"
          >
            <Icon name="archive-outline" size={16} color="#64748b" />
          </button>
        ) : null}
      </div>
    </div>
  );
});
