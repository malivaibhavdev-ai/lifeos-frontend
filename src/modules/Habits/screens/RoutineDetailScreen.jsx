import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useHabitList, useUpdateHabit } from '../hooks/useHabits';
import { useRoutine, useRoutineProgress } from '../hooks/useRoutines';
import { HabitCard } from '../components/HabitCard';
import { RoutineFormSheet } from '../components/RoutineFormSheet';
import { ProgressRing } from '../components/ProgressRing';

export function RoutineDetailScreen() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const [showEdit, setShowEdit] = useState(false);

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: routine } = useRoutine(routineId);
  const { data: progress } = useRoutineProgress(routineId, today);
  const { data: habitsData } = useHabitList({});
  const updateHabit = useUpdateHabit();

  const memberHabits = useMemo(
    () => (habitsData ?? EMPTY_ARRAY).filter((h) => h.routine === routineId).sort((a, b) => a.routineOrder - b.routineOrder),
    [habitsData, routineId]
  );

  const moveHabit = useCallback(
    (habit, direction) => {
      const index = memberHabits.findIndex((h) => h._id === habit._id);
      const swapIndex = index + direction;
      if (swapIndex < 0 || swapIndex >= memberHabits.length) return;
      const other = memberHabits[swapIndex];
      updateHabit.mutate({ id: habit._id, payload: { routineOrder: other.routineOrder } });
      updateHabit.mutate({ id: other._id, payload: { routineOrder: habit.routineOrder } });
    },
    [memberHabits, updateHabit]
  );

  const handleOpenHabit = useCallback((habit) => navigate(`/habits/${habit._id}`), [navigate]);

  if (!routine) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
            role="status"
            aria-label="Loading"
          />
        </div>
      </Screen>
    );
  }

  const color = routine.color ?? '#2563eb';
  const ratio = progress?.total ? progress.completed / progress.total : 0;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl">
      <div className="flex flex-row items-center justify-between pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <button type="button" onClick={() => setShowEdit(true)} aria-label="Edit routine">
          <Icon name="create-outline" size={22} color="#64748b" />
        </button>
      </div>

      <div className="flex flex-row items-center pb-4">
        <ProgressRing size={56} strokeWidth={4} progress={ratio} color={color}>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {progress?.completed ?? 0}/{progress?.total ?? 0}
          </span>
        </ProgressRing>
        <p className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">{routine.name}</p>
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto -mx-4 sm:-mx-6 lg:-mx-8">
        {memberHabits.length === 0 ? (
          <EmptyState
            icon="list-outline"
            title="No habits in this routine"
            description="Add this routine to a habit from that habit's edit screen."
          />
        ) : (
          memberHabits.map((habit, index) => (
            <div key={habit._id} className="flex flex-row items-center">
              <div className="min-w-0 flex-1">
                <HabitCard habit={habit} date={today} swipeEnabled={false} onPress={handleOpenHabit} />
              </div>
              <div className="-ml-2 mr-4 flex flex-col">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveHabit(habit, -1)}
                  aria-label="Move up"
                  className="p-1"
                >
                  <Icon name="chevron-up" size={16} color={index === 0 ? '#cbd5e1' : '#64748b'} />
                </button>
                <button
                  type="button"
                  disabled={index === memberHabits.length - 1}
                  onClick={() => moveHabit(habit, 1)}
                  aria-label="Move down"
                  className="p-1"
                >
                  <Icon name="chevron-down" size={16} color={index === memberHabits.length - 1 ? '#cbd5e1' : '#64748b'} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </PageContainer>

      <RoutineFormSheet visible={showEdit} onClose={() => setShowEdit(false)} routine={routine} />
    </Screen>
  );
}
