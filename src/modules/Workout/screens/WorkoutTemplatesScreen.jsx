import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { WORKOUT_TYPES } from '../../Health/constants/healthConstants';
import { useCreateWorkoutTemplate, useDeleteWorkoutTemplate, useWorkoutTemplateList } from '../hooks/useWorkouts';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

function ExerciseRow({ exercise, onChange, onRemove }) {
  return (
    <div className="mb-2 flex flex-row items-center rounded-xl border border-gray-200 p-2.5 dark:border-gray-700">
      <input
        value={exercise.name}
        onChange={(e) => onChange({ ...exercise, name: e.target.value })}
        placeholder="Exercise name"
        className="flex-1 bg-transparent text-sm text-gray-900 outline-none dark:text-white"
      />
      <input
        value={String(exercise.sets ?? '')}
        onChange={(e) => onChange({ ...exercise, sets: e.target.value.replace(/[^0-9]/g, '') })}
        placeholder="Sets"
        inputMode="numeric"
        className="ml-2 w-14 bg-transparent text-sm text-gray-900 outline-none dark:text-white"
      />
      <input
        value={String(exercise.reps ?? '')}
        onChange={(e) => onChange({ ...exercise, reps: e.target.value.replace(/[^0-9]/g, '') })}
        placeholder="Reps"
        inputMode="numeric"
        className="ml-2 w-14 bg-transparent text-sm text-gray-900 outline-none dark:text-white"
      />
      <button type="button" aria-label="Remove exercise" onClick={onRemove} className="ml-2">
        <Icon name="close-circle" size={20} color="#cbd5e1" />
      </button>
    </div>
  );
}

const TemplateRow = memo(function TemplateRow({ template, onDelete }) {
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          {template.type} · {template.exercises.length} exercises
        </p>
      </div>
      <button type="button" aria-label="Delete template" onContextMenu={(e) => { e.preventDefault(); onDelete(template._id); }} onClick={() => onDelete(template._id)} className="p-1">
        <Icon name="trash-outline" size={16} color="#ef4444" />
      </button>
    </div>
  );
});

export function WorkoutTemplatesScreen() {
  const navigate = useNavigate();
  const { data: templates } = useWorkoutTemplateList();
  const createTemplate = useCreateWorkoutTemplate();
  const deleteTemplate = useDeleteWorkoutTemplate();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Strength');
  const [exercises, setExercises] = useState([]);

  const items = templates ?? EMPTY_ARRAY;

  const addExercise = () => setExercises([...exercises, { name: '', sets: 3, reps: 10 }]);
  const updateExercise = (i, next) => setExercises(exercises.map((e, idx) => (idx === i ? next : e)));
  const removeExercise = (i) => setExercises(exercises.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!name.trim()) return;
    createTemplate.mutate(
      { name: name.trim(), type, exercises: exercises.filter((e) => e.name.trim()) },
      { onSuccess: () => { setShowForm(false); setName(''); setExercises([]); } }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Workout Templates</p>
        <button type="button" aria-label="New template" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="list-outline" title="No templates yet" description="Save a reusable exercise list for quick logging." />
        ) : (
          items.map((template) => <TemplateRow key={template._id} template={template} onDelete={deleteTemplate.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="New Template">
        <div className="mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name *"
            className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none dark:text-white"
          />
        </div>

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
          <div className="mb-1.5 flex flex-row items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises</p>
            <button type="button" onClick={addExercise} className="flex flex-row items-center">
              <Icon name="add-circle-outline" size={16} color="#2563eb" />
              <span className="ml-1 text-xs font-semibold text-primary-600">Add</span>
            </button>
          </div>
          {exercises.map((ex, i) => (
            <ExerciseRow key={i} exercise={ex} onChange={(next) => updateExercise(i, next)} onRemove={() => removeExercise(i)} />
          ))}
        </div>
      </Modal>
    </Screen>
  );
}
