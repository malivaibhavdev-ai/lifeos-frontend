import { memo } from 'react';
import dayjs from 'dayjs';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { Icon } from '../../../components/ui/Icon';
import { GOAL_TYPES, GOAL_STATUS } from '../constants/goalConstants';

// Memoized: rendered in `.map()` loops on the Goals workspace and Dashboard
// widget. `onLongPress` (edit/archive menu) was previously only reachable
// via right-click/context-menu with no visible affordance — a hover-
// revealed (always-visible on touch) "more options" button now exposes the
// same action so mouse/keyboard users without a right-click can discover it.
export const GoalCard = memo(function GoalCard({ goal, onPress, onLongPress }) {
  const typeMeta = GOAL_TYPES[goal.type] ?? GOAL_TYPES.custom;
  const statusMeta = GOAL_STATUS[goal.status] ?? GOAL_STATUS.not_started;
  const color = goal.color ?? '#2563eb';
  const progress = (goal.progress ?? 0) / 100;

  return (
    <div className="group relative mx-4 mb-2.5">
      <button
        type="button"
        onClick={() => onPress?.(goal)}
        onContextMenu={(e) => {
          e.preventDefault();
          onLongPress?.(goal);
        }}
        className={`flex w-full flex-row items-center rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-gray-900 ${onLongPress ? 'pr-10' : ''}`}
      >
        <ProgressRing size={44} strokeWidth={3.5} progress={progress} color={color}>
          {goal.emoji ? (
            <span className="text-lg">{goal.emoji}</span>
          ) : (
            <Icon name={goal.icon || typeMeta.icon} size={18} color={color} />
          )}
        </ProgressRing>

        <div className="ml-3 flex-1 min-w-0">
          <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{goal.title}</p>
          <div className="mt-0.5 flex flex-row items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{typeMeta.label}</span>
            <div className="mx-1.5 h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="rounded-full px-1.5 py-0.5" style={{ backgroundColor: `${statusMeta.color}20` }}>
              <span className="text-[10px] font-semibold" style={{ color: statusMeta.color }}>
                {statusMeta.label}
              </span>
            </div>
            {goal.targetDate ? (
              <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{dayjs(goal.targetDate).format('MMM D')}</span>
            ) : null}
          </div>
        </div>

        <span className="ml-2 text-sm font-bold" style={{ color }}>
          {Math.round(goal.progress ?? 0)}%
        </span>
      </button>

      {onLongPress ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLongPress(goal);
          }}
          aria-label={`More options for ${goal.title}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 dark:bg-gray-800"
        >
          <Icon name="ellipsis-horizontal" size={14} color="#64748b" />
        </button>
      ) : null}
    </div>
  );
});
