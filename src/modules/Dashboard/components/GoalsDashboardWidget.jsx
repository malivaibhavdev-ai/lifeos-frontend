import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGoalList } from '../../Goals/hooks/useGoals';
import { useMilestoneList } from '../../Goals/hooks/useMilestones';
import { GoalCard } from '../../Goals/components/GoalCard';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Icon } from '../../../components/ui/Icon';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

export function GoalsDashboardWidget() {
  const navigate = useNavigate();

  const { data: goalsData } = useGoalList({ includeArchived: false, status: 'in_progress' });
  const activeGoals = goalsData ?? EMPTY_ARRAY;
  const { data: milestonesData } = useMilestoneList({});
  const milestones = milestonesData ?? EMPTY_ARRAY;

  const upcomingMilestones = useMemo(() => {
    const in7Days = dayjs().add(7, 'day');
    return milestones
      .filter((m) => m.status !== 'completed' && m.dueDate && dayjs(m.dueDate).isBefore(in7Days))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [milestones]);

  const averageProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress ?? 0), 0) / activeGoals.length)
    : 0;

  if (activeGoals.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
      <button type="button" onClick={() => navigate('/goals')} className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-2.5 h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#8b5cf620' }}>
            <Icon name="flag" size={16} color="#8b5cf6" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white">Goals</p>
        </div>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </button>

      <div className="mt-3 flex flex-row items-center">
        <ProgressRing size={52} strokeWidth={4} progress={averageProgress / 100} color="#2563eb">
          <AnimatedNumber value={averageProgress} formatter={(n) => `${Math.round(n)}%`} className="text-xs font-bold text-gray-900 dark:text-white" />
        </ProgressRing>
        <div className="ml-4 flex flex-1 flex-row justify-around">
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{activeGoals.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-amber-500">{upcomingMilestones.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Due soon</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {activeGoals.slice(0, 3).map((goal) => (
          <GoalCard key={goal._id} goal={goal} onPress={() => navigate(`/goals/${goal._id}`)} />
        ))}
      </div>
    </div>
  );
}
