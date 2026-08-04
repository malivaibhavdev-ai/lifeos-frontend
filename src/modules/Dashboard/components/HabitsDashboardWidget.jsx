import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCalendarOccurrences } from '../../Calendar/hooks/useCalendarEngine';
import { useHabitList } from '../../Habits/hooks/useHabits';
import { HabitCard } from '../../Habits/components/HabitCard';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { filterTodayHabits } from '../../Habits/utils/todayHabits';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Icon } from '../../../components/ui/Icon';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

// Same "standalone, sources its own module's hooks" pattern as every other
// Dashboard widget — sources data directly from the Habits module's own
// hooks, not a backend dashboard aggregate.
export function HabitsDashboardWidget() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { from, to } = useMemo(
    () => ({ from: dayjs().startOf('day').toISOString(), to: dayjs().endOf('day').toISOString() }),
    []
  );

  const { data: habitsData } = useHabitList({ includeArchived: false });
  const habits = habitsData ?? EMPTY_ARRAY;
  const { data: occurrences } = useCalendarOccurrences(from, to, ['habit']);
  const todayHabits = useMemo(() => filterTodayHabits(habits, occurrences), [habits, occurrences]);

  const completed = (occurrences ?? []).filter((o) => o.isCompleted).length;
  const total = todayHabits.length;
  const remaining = Math.max(total - completed, 0);
  const ratio = total > 0 ? completed / total : 0;

  if (total === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
      <button type="button" onClick={() => navigate('/habits')} className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-2.5 h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#14b8a620' }}>
            <Icon name="repeat" size={16} color="#14b8a6" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white">Today's Habits</p>
        </div>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </button>

      <div className="mt-3 flex flex-row items-center">
        <ProgressRing size={52} strokeWidth={4} progress={ratio} color="#2563eb">
          <AnimatedNumber value={ratio * 100} formatter={(n) => `${Math.round(n)}%`} className="text-xs font-bold text-gray-900 dark:text-white" />
        </ProgressRing>
        <div className="ml-4 flex flex-1 flex-row justify-around">
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-success">{completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-amber-500">{remaining}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {todayHabits.slice(0, 3).map((habit) => (
          <HabitCard key={habit._id} habit={habit} date={today} swipeEnabled={false} onPress={() => navigate(`/habits/${habit._id}`)} />
        ))}
      </div>
    </div>
  );
}
