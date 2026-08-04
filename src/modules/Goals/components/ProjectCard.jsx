import { memo } from 'react';
import dayjs from 'dayjs';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { Icon } from '../../../components/ui/Icon';
import { PROJECT_STATUS } from '../constants/goalConstants';

// Memoized: rendered in `.map()` loops on the Goals workspace (Projects tab)
// and inside GoalDetailScreen's nested project list. `onLongPress` (edit/
// archive) previously had no visible affordance outside right-click — see
// GoalCard for the same fix.
export const ProjectCard = memo(function ProjectCard({ project, onPress, onLongPress }) {
  const statusMeta = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.not_started;
  const color = project.color ?? '#2563eb';
  const progress = (project.progress ?? 0) / 100;

  return (
    <div className="group relative mx-4 mb-2.5">
      <button
        type="button"
        onClick={() => onPress?.(project)}
        onContextMenu={(e) => {
          e.preventDefault();
          onLongPress?.(project);
        }}
        className={`flex w-full flex-row items-center rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-gray-900 ${onLongPress ? 'pr-10' : ''}`}
      >
        <ProgressRing size={40} strokeWidth={3} progress={progress} color={color}>
          {project.emoji ? (
            <span className="text-base">{project.emoji}</span>
          ) : (
            <Icon name={project.icon || 'folder-outline'} size={16} color={color} />
          )}
        </ProgressRing>

        <div className="ml-3 flex-1 min-w-0">
          <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{project.name}</p>
          <div className="mt-0.5 flex flex-row items-center">
            <div className="rounded-full px-1.5 py-0.5" style={{ backgroundColor: `${statusMeta.color}20` }}>
              <span className="text-[10px] font-semibold" style={{ color: statusMeta.color }}>
                {statusMeta.label}
              </span>
            </div>
            {project.targetDate ? (
              <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{dayjs(project.targetDate).format('MMM D')}</span>
            ) : null}
          </div>
        </div>

        <span className="ml-2 text-sm font-bold" style={{ color }}>
          {Math.round(project.progress ?? 0)}%
        </span>
      </button>

      {onLongPress ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLongPress(project);
          }}
          aria-label={`More options for ${project.name}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 dark:bg-gray-800"
        >
          <Icon name="ellipsis-horizontal" size={14} color="#64748b" />
        </button>
      ) : null}
    </div>
  );
});
