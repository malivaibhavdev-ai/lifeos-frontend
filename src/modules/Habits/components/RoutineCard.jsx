import { memo } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useRoutineProgress } from '../hooks/useRoutines';
import { ProgressRing } from './ProgressRing';
import { ROUTINE_TIME_OF_DAY } from '../constants/habitConstants';

// Memoized: rendered in a `.map()` loop on the Habits workspace's Routines
// tab. `onPress` receives the routine object (not the click event) so
// callers can pass one stable useCallback instead of an inline arrow per row.
export const RoutineCard = memo(function RoutineCard({ routine, date, onPress }) {
  const { data: progress } = useRoutineProgress(routine._id, date);
  const total = progress?.total ?? 0;
  const completed = progress?.completed ?? 0;
  const ratio = total > 0 ? completed / total : 0;
  const timeOfDay = ROUTINE_TIME_OF_DAY[routine.timeOfDay] ?? ROUTINE_TIME_OF_DAY.custom;
  const color = routine.color ?? '#2563eb';

  return (
    <button
      type="button"
      onClick={() => onPress?.(routine)}
      className="mb-2.5 flex w-full flex-row items-center rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-gray-900"
    >
      <ProgressRing size={44} strokeWidth={3.5} progress={ratio} color={color}>
        <Icon name={routine.icon || timeOfDay.icon} size={18} color={color} />
      </ProgressRing>
      <div className="ml-3 flex-1">
        <p className="text-base font-semibold text-gray-900 dark:text-white">{routine.name}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {timeOfDay.label} · {completed}/{total} done
        </p>
      </div>
      <Icon name="chevron-forward" size={18} color="#94a3b8" />
    </button>
  );
});
