import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useCalendarOccurrences } from '../../Calendar/hooks/useCalendarEngine';
import { useArchiveHabit, useHabitList } from '../hooks/useHabits';
import { useRoutineList } from '../hooks/useRoutines';
import { HabitCard } from '../components/HabitCard';
import { HabitFormSheet } from '../components/HabitFormSheet';
import { RoutineCard } from '../components/RoutineCard';
import { RoutineFormSheet } from '../components/RoutineFormSheet';
import { filterTodayHabits } from '../utils/todayHabits';

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'all', label: 'All Habits' },
  { key: 'routines', label: 'Routines' },
];

export function HabitsWorkspaceScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [showForm, setShowForm] = useState(false);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [actionHabit, setActionHabit] = useState(null);

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { from, to } = useMemo(
    () => ({ from: dayjs().startOf('day').toISOString(), to: dayjs().endOf('day').toISOString() }),
    []
  );

  const { data: habitsData, isLoading } = useHabitList({ includeArchived: false });
  const habits = habitsData ?? EMPTY_ARRAY;
  const { data: occurrences } = useCalendarOccurrences(from, to, ['habit']);
  const todayHabits = useMemo(() => filterTodayHabits(habits, occurrences), [habits, occurrences]);

  const { data: routinesData } = useRoutineList({});
  const routines = routinesData ?? EMPTY_ARRAY;

  const archiveHabit = useArchiveHabit();

  const handleOpenHabit = useCallback((habit) => navigate(`/habits/${habit._id}`), [navigate]);
  const handleOpenRoutine = useCallback((routine) => navigate(`/habits/routines/${routine._id}`), [navigate]);
  const handleArchive = useCallback((habit) => archiveHabit.mutate({ id: habit._id, isArchived: true }), [archiveHabit]);

  const displayedHabits = activeTab === 'today' ? todayHabits : habits;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between pb-2 pt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Habits</p>
        <button
          type="button"
          onClick={() => (activeTab === 'routines' ? setShowRoutineForm(true) : setShowForm(true))}
          aria-label={activeTab === 'routines' ? 'New routine' : 'New habit'}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600"
        >
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 items-center rounded-lg py-1.5 ${activeTab === tab.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <span
              className={`text-xs font-semibold ${
                activeTab === tab.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
        {activeTab === 'routines' ? (
          routines.length === 0 ? (
            <EmptyState
              icon="list-outline"
              title="No routines yet"
              description="Group habits into a Morning, Afternoon, or Evening routine."
              ctaLabel="New Routine"
              onCtaPress={() => setShowRoutineForm(true)}
            />
          ) : (
            <div>
              {routines.map((routine) => (
                <RoutineCard key={routine._id} routine={routine} date={today} onPress={handleOpenRoutine} />
              ))}
            </div>
          )
        ) : !isLoading && displayedHabits.length === 0 ? (
          <EmptyState
            icon="repeat-outline"
            title={activeTab === 'today' ? 'Nothing scheduled today' : 'No habits yet'}
            description={activeTab === 'today' ? 'Enjoy the free time, or add a new habit.' : 'Add a habit to start building your streak.'}
            ctaLabel="Add a habit"
            onCtaPress={() => setShowForm(true)}
          />
        ) : (
          <div className="pt-1 -mx-4 sm:-mx-6 lg:-mx-8">
            {displayedHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                date={today}
                onPress={handleOpenHabit}
                onLongPress={setActionHabit}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </div>
      </PageContainer>

      <HabitFormSheet visible={showForm} onClose={() => setShowForm(false)} habit={null} />
      <RoutineFormSheet visible={showRoutineForm} onClose={() => setShowRoutineForm(false)} routine={null} />

      <Modal visible={Boolean(actionHabit)} onClose={() => setActionHabit(null)} title={actionHabit?.name ?? ''}>
        <button
          type="button"
          onClick={() => {
            handleOpenHabit(actionHabit);
            setActionHabit(null);
          }}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 text-left dark:border-gray-800"
        >
          <Icon name="stats-chart-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">View details</span>
        </button>
        <button
          type="button"
          onClick={() => {
            handleArchive(actionHabit);
            setActionHabit(null);
          }}
          className="flex w-full flex-row items-center py-3.5 text-left"
        >
          <Icon name="archive-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">Archive</span>
        </button>
      </Modal>
    </Screen>
  );
}
