import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { WORKOUT_TYPES, WORKOUT_INTENSITY } from '../../Health/constants/healthConstants';
import { useCreateWorkout, useDeleteWorkout, useWorkoutList, useWorkoutStreak } from '../hooks/useWorkouts';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const WorkoutRow = memo(function WorkoutRow({ workout, onDelete }) {
  const intensityMeta = workout.intensity ? WORKOUT_INTENSITY[workout.intensity] : null;
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{workout.type}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {dayjs(workout.date).format('MMM D')} · {workout.durationMinutes}m
          {intensityMeta ? ` · ${intensityMeta.label}` : ''}
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{workout.caloriesBurned} kcal</span>
        <button type="button" aria-label="Delete workout entry" onContextMenu={(e) => { e.preventDefault(); onDelete(workout._id); }} onClick={() => onDelete(workout._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function WorkoutLogScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: streak } = useWorkoutStreak();
  const { data: history } = useWorkoutList({ limit: 30 });
  const createWorkout = useCreateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('Strength');
  const [intensity, setIntensity] = useState('medium');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const items = history?.items ?? EMPTY_ARRAY;

  const handleSave = () => {
    createWorkout.mutate(
      {
        date: today,
        type,
        intensity,
        durationMinutes: Number(durationMinutes) || 0,
        caloriesBurned: Number(caloriesBurned) || 0,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDurationMinutes('');
          setCaloriesBurned('');
        },
      }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Workout</p>
        <div className="flex flex-row items-center">
          <button type="button" aria-label="Workout templates" onClick={() => navigate('/health/workout-templates')} className="mr-3">
            <Icon name="list-outline" size={20} color="#64748b" />
          </button>
          <button type="button" aria-label="Log workout" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>
      </div>

      <div className="mx-4 mb-4 flex flex-row items-center justify-center rounded-2xl bg-white py-5 dark:bg-gray-900">
        <Icon name="flame" size={22} color="#f59e0b" />
        <p className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">{streak?.currentStreak ?? 0}</p>
        <p className="ml-1.5 text-sm text-gray-500 dark:text-gray-400">day streak</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="barbell-outline" title="No workouts logged yet" description="Log a workout to start your streak." />
        ) : (
          items.map((workout) => <WorkoutRow key={workout._id} workout={workout} onDelete={deleteWorkout.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Workout">
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
          <div className="flex flex-row overflow-x-auto">
            {WORKOUT_TYPES.map((t) => {
              const isSelected = type === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Intensity</p>
          <div className="flex flex-row gap-1.5">
            {Object.keys(WORKOUT_INTENSITY).map((key) => {
              const meta = WORKOUT_INTENSITY[key];
              const isSelected = intensity === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setIntensity(key)}
                  className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-row gap-3">
          <div className="mb-4 flex-1">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Duration (min)</p>
            <input
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4 flex-1">
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Calories</p>
            <input
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </Modal>
    </Screen>
  );
}
