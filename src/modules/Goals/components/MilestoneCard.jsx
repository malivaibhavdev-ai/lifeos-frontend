import { memo } from 'react';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { MILESTONE_STATUS } from '../constants/goalConstants';

// Memoized: rendered in `.map()` loops on GoalDetailScreen/ProjectDetailScreen.
// Unlike GoalCard/ProjectCard, both current call sites already wire `onPress`
// to open the edit sheet directly (a visible click target, not context-menu-
// only), so no extra kebab affordance is needed here.
export const MilestoneCard = memo(function MilestoneCard({ milestone, onPress, onLongPress, blocked = false }) {
  const statusMeta = MILESTONE_STATUS[milestone.status] ?? MILESTONE_STATUS.not_started;
  const isCompleted = milestone.status === 'completed';
  const isOverdue = !isCompleted && milestone.dueDate && dayjs(milestone.dueDate).isBefore(dayjs(), 'day');

  return (
    <button
      type="button"
      onClick={() => onPress?.(milestone)}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress?.(milestone);
      }}
      className="mx-4 mb-2 flex flex-row items-center rounded-xl border border-gray-100 bg-white p-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${statusMeta.color}20` }}
      >
        <Icon
          name={isCompleted ? 'checkmark' : blocked ? 'lock-closed-outline' : 'flag-outline'}
          size={16}
          color={statusMeta.color}
        />
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <p
          className={`truncate text-sm font-semibold text-gray-900 dark:text-white ${isCompleted ? 'line-through opacity-60' : ''}`}
        >
          {milestone.title}
        </p>
        <div className="mt-0.5 flex flex-row items-center">
          {milestone.dueDate ? (
            <span className={`text-xs ${isOverdue ? 'font-medium text-danger' : 'text-gray-400 dark:text-gray-500'}`}>
              {isOverdue ? 'Overdue · ' : ''}
              {dayjs(milestone.dueDate).format('MMM D, YYYY')}
            </span>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">No due date</span>
          )}
        </div>
      </div>

      <span className="ml-2 text-xs font-bold" style={{ color: statusMeta.color }}>
        {Math.round(milestone.progress ?? 0)}%
      </span>
    </button>
  );
});
