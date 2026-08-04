import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { MEAL_TYPES, MEAL_TYPES_ORDER } from '../constants/healthConstants';
import { useCreateMeal, useDailyNutritionTotals, useDeleteMeal, useMealList } from '../hooks/useNutrition';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const MealRow = memo(function MealRow({ meal, onDelete }) {
  const meta = MEAL_TYPES[meal.mealType];
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <Icon name={meta.icon} size={16} color="#22c55e" />
      <div className="ml-3 min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{meal.name || meta.label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{meta.label} · {meal.calories} kcal</p>
      </div>
      <button type="button" aria-label="Delete meal entry" onContextMenu={(e) => { e.preventDefault(); onDelete(meal._id); }} onClick={() => onDelete(meal._id)} className="p-1">
        <Icon name="trash-outline" size={16} color="#ef4444" />
      </button>
    </div>
  );
});

export function NutritionScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: mealsData } = useMealList({ from: today, to: today });
  const { data: totals } = useDailyNutritionTotals(today);
  const createMeal = useCreateMeal();
  const deleteMeal = useDeleteMeal();
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [form, setForm] = useState({ name: '', calories: '', proteinG: '', carbsG: '', fatG: '' });

  const meals = mealsData?.items ?? EMPTY_ARRAY;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = () => {
    createMeal.mutate(
      {
        date: today,
        mealType,
        name: form.name.trim(),
        calories: Number(form.calories) || 0,
        proteinG: Number(form.proteinG) || 0,
        carbsG: Number(form.carbsG) || 0,
        fatG: Number(form.fatG) || 0,
      },
      { onSuccess: () => { setShowForm(false); setForm({ name: '', calories: '', proteinG: '', carbsG: '', fatG: '' }); } }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Nutrition</p>
        <button type="button" aria-label="Log meal" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      {totals ? (
        <div className="mx-4 mb-4 flex flex-row justify-around rounded-2xl bg-white py-4 dark:bg-gray-900">
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.calories}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">kcal</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.proteinG}g</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Protein</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.carbsG}g</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Carbs</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.fatG}g</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Fat</p>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pb-6">
        {meals.length === 0 ? (
          <EmptyState icon="restaurant-outline" title="No meals logged today" description="Track what you eat to see daily totals." />
        ) : (
          meals.map((meal) => <MealRow key={meal._id} meal={meal} onDelete={deleteMeal.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Meal">
        <div className="mb-4 flex flex-row flex-wrap gap-1.5">
          {MEAL_TYPES_ORDER.map((key) => {
            const meta = MEAL_TYPES[key];
            const isSelected = mealType === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setMealType(key)}
                className={`flex flex-row items-center rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
              >
                <Icon name={meta.icon} size={13} color={isSelected ? '#fff' : '#64748b'} />
                <span className={`ml-1.5 text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Name</p>
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Grilled chicken salad"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="flex flex-row flex-wrap justify-between">
          {[
            ['calories', 'Calories'],
            ['proteinG', 'Protein (g)'],
            ['carbsG', 'Carbs (g)'],
            ['fatG', 'Fat (g)'],
          ].map(([key, label]) => (
            <div key={key} className="mb-4 w-[48%]">
              <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
              <input
                value={form[key]}
                onChange={(e) => set({ [key]: e.target.value.replace(/[^0-9.]/g, '') })}
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          ))}
        </div>
      </Modal>
    </Screen>
  );
}
