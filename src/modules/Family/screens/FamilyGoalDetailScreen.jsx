import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMembers } from '../hooks/useFamily';
import { useFamilyGoal, useAddContribution, useToggleGoalMilestone, useDeleteFamilyGoal } from '../hooks/useFamilyGoals';

export function FamilyGoalDetailScreen() {
  const navigate = useNavigate();
  const { goalId } = useParams();
  const { householdId } = useActiveHousehold();
  const { data, isLoading } = useFamilyGoal(householdId, goalId);
  const { data: members } = useFamilyMembers(householdId);
  const addContribution = useAddContribution(householdId);
  const toggleMilestone = useToggleGoalMilestone(householdId);
  const deleteGoal = useDeleteFamilyGoal(householdId);

  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState('');
  const [contributor, setContributor] = useState(null);

  if (isLoading || !data) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </Screen>
    );
  }

  const { goal, contributions } = data;

  const handleContribute = () => {
    if (!amount || !contributor) return;
    addContribution.mutate(
      { id: goalId, payload: { contributor, amount: Number(amount), date: dayjs().format('YYYY-MM-DD') } },
      { onSuccess: () => { setShowContribute(false); setAmount(''); } }
    );
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <button type="button" onClick={() => deleteGoal.mutate(goalId, { onSuccess: () => navigate(-1) })} aria-label="Delete goal">
            <Icon name="trash-outline" size={20} color="#94a3b8" />
          </button>
        </div>

        <p className="text-2xl font-bold text-gray-900 dark:text-white">{goal.title}</p>
        <p className="mb-4 text-sm capitalize text-gray-500 dark:text-gray-400">{goal.goalType}</p>

        <div className="mb-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <div className="mb-2 flex flex-row items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${goal.progress}%` }} />
          </div>
          {goal.targetAmount ? <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{goal.currentAmount} of {goal.targetAmount}</p> : null}
        </div>

        {goal.targetAmount ? (
          <button type="button" onClick={() => setShowContribute(true)} className="mb-4 h-11 w-full rounded-xl bg-primary-600 text-sm font-semibold text-white">
            Add Contribution
          </button>
        ) : null}

        {goal.milestones?.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Milestones</p>
            {goal.milestones.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => toggleMilestone.mutate({ id: goalId, milestoneId: m._id, isCompleted: !m.isCompleted })}
                className="mb-2 flex w-full flex-row items-center rounded-xl bg-gray-50 px-3 py-2.5 text-left dark:bg-gray-900"
              >
                <Icon name={m.isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={m.isCompleted ? '#22c55e' : '#94a3b8'} />
                <span className={`ml-2 text-sm ${m.isCompleted ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>{m.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        {contributions?.length > 0 ? (
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Contributions</p>
            {contributions.map((c) => (
              <div key={c._id} className="mb-1.5 flex flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-900">
                <span className="text-sm text-gray-900 dark:text-white">{c.contributor?.name}</span>
                <span className="text-sm font-medium text-primary-600">+{c.amount}</span>
              </div>
            ))}
          </div>
        ) : null}
      </PageContainer>

      <Modal visible={showContribute} onClose={() => setShowContribute(false)} onDone={handleContribute} title="Add Contribution">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Contributor</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {(members ?? []).map((m) => (
            <button key={m._id} type="button" onClick={() => setContributor(m._id)} className={`rounded-full border px-3 py-1.5 ${contributor === m._id ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs ${contributor === m._id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.name}</span>
            </button>
          ))}
        </div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <button type="button" onClick={handleContribute} disabled={addContribution.isPending || !amount || !contributor} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
          {addContribution.isPending ? 'Adding…' : 'Add'}
        </button>
      </Modal>
    </Screen>
  );
}
