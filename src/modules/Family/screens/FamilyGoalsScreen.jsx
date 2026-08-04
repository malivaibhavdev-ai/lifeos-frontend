import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyGoals, useCreateFamilyGoal } from '../hooks/useFamilyGoals';

const GOAL_TYPES = ['vacation', 'education', 'savings', 'fitness', 'relationship', 'celebration', 'home', 'custom'];

export function FamilyGoalsScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: goals, isLoading } = useFamilyGoals(householdId, { status: 'active' });
  const createGoal = useCreateFamilyGoal(householdId);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('custom');
  const [targetAmount, setTargetAmount] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    createGoal.mutate(
      { title: title.trim(), goalType, targetAmount: targetAmount ? Number(targetAmount) : undefined },
      { onSuccess: () => { setShowForm(false); setTitle(''); setTargetAmount(''); } }
    );
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Family Goals</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && (goals ?? []).length === 0 ? (
          <EmptyState icon="flag-outline" title="No family goals yet" description="Set a goal your family can work toward together." ctaLabel="New goal" onCtaPress={() => setShowForm(true)} />
        ) : (
          (goals ?? []).map((g) => (
            <button
              key={g._id}
              type="button"
              onClick={() => navigate(`/family/goals/${g._id}`)}
              className="mb-3 block w-full rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-row items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">{g.title}</span>
                <span className="text-xs capitalize text-gray-400 dark:text-gray-500">{g.goalType}</span>
              </div>
              {g.targetAmount ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{g.currentAmount} / {g.targetAmount}</p> : null}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${g.progress}%` }} />
              </div>
            </button>
          ))
        )}
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleCreate} title="New Family Goal">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal title *"
          className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {GOAL_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setGoalType(t)} className={`rounded-full border px-3 py-1.5 ${goalType === t ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs capitalize ${goalType === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t}</span>
            </button>
          ))}
        </div>
        <input
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="Target amount (optional)"
          type="number"
          className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <button type="button" onClick={handleCreate} disabled={createGoal.isPending || !title.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
          {createGoal.isPending ? 'Creating…' : 'Create Goal'}
        </button>
      </Modal>
    </Screen>
  );
}
