import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useGoalList } from '../hooks/useGoals';
import { useMilestoneList } from '../hooks/useMilestones';

function Spinner({ size = 20, color = '#2563eb' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

function buildTimeline(goals, milestones) {
  const items = [];
  for (const g of goals) {
    if (!g.targetDate) continue;
    items.push({ key: `goal-${g._id}`, type: 'goal', date: g.targetDate, title: g.title, isCompleted: g.status === 'completed', color: g.color ?? '#2563eb', id: g._id });
  }
  for (const m of milestones) {
    if (!m.dueDate) continue;
    items.push({ key: `milestone-${m._id}`, type: 'milestone', date: m.dueDate, title: m.title, isCompleted: m.status === 'completed', color: '#9333ea', id: m._id });
  }
  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groups = [];
  let currentMonthKey = null;
  for (const item of items) {
    const monthKey = dayjs(item.date).format('YYYY-MM');
    if (monthKey !== currentMonthKey) {
      groups.push({ monthKey, monthLabel: dayjs(item.date).format('MMMM YYYY'), items: [] });
      currentMonthKey = monthKey;
    }
    groups[groups.length - 1].items.push(item);
  }
  return groups;
}

export function RoadmapScreen() {
  const navigate = useNavigate();
  const { data: goalsData, isLoading: goalsLoading } = useGoalList({ includeArchived: false });
  const { data: milestonesData, isLoading: milestonesLoading } = useMilestoneList({});
  const goals = goalsData ?? EMPTY_ARRAY;
  const milestones = milestonesData ?? EMPTY_ARRAY;

  const groups = useMemo(() => buildTimeline(goals, milestones), [goals, milestones]);
  const isLoading = goalsLoading || milestonesLoading;

  const handlePress = (item) => {
    if (item.type === 'goal') navigate(`/goals/${item.id}`);
  };

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
      <div className="-mx-4 flex flex-1 min-h-0 flex-col sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center px-4 pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} className="mr-3" aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Roadmap</p>
      </div>

      {isLoading ? (
        <div className="mt-10 flex items-center justify-center">
          <Spinner />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="Nothing on the roadmap yet"
          description="Add target dates to goals or due dates to milestones to see them here."
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pb-6">
          {groups.map((group) => (
            <div key={group.monthKey} className="mb-2">
              <p className="mb-2 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">{group.monthLabel}</p>
              {group.items.map((item, idx) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handlePress(item)}
                  className="mx-4 flex w-full flex-row text-left"
                >
                  <div className="mr-3 flex flex-col items-center">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.isCompleted ? '#22c55e' : item.color }}
                    />
                    {idx < group.items.length - 1 ? <div className="w-px flex-1 bg-gray-200 dark:bg-gray-800" style={{ minHeight: 28 }} /> : null}
                  </div>
                  <div className="mb-4 flex flex-1 flex-row items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p
                        className={`truncate text-sm font-semibold text-gray-900 dark:text-white ${item.isCompleted ? 'line-through opacity-60' : ''}`}
                      >
                        {item.title}
                      </p>
                      <div className="mt-0.5 flex flex-row items-center">
                        <Icon name={item.type === 'goal' ? 'flag' : 'flag-outline'} size={11} color={item.color} />
                        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                          {item.type === 'goal' ? 'Goal' : 'Milestone'} · {dayjs(item.date).format('MMM D')}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      </div>
      </PageContainer>
    </Screen>
  );
}
