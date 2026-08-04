import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMembers } from '../hooks/useFamily';
import { useChores, useCreateChore, useDeleteChore, useLogChoreCompletion, useChoreLeaderboard } from '../hooks/useChores';

const CATEGORIES = ['cleaning', 'cooking', 'laundry', 'shopping', 'gardening', 'pet_care', 'homework', 'custom'];
const TABS = [{ key: 'list', label: 'Chores' }, { key: 'leaderboard', label: 'Leaderboard' }];

function ChoreFormModal({ visible, onClose, householdId, members }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('custom');
  const [points, setPoints] = useState('10');
  const [assignedTo, setAssignedTo] = useState([]);
  const createChore = useCreateChore(householdId);

  const toggleAssignee = (id) => setAssignedTo((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = () => {
    if (!title.trim()) return;
    createChore.mutate(
      { title: title.trim(), category, points: Number(points) || 10, assignedTo },
      { onSuccess: () => { onClose(); setTitle(''); setAssignedTo([]); } }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Chore">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Chore title *"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
      <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1.5 ${category === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs capitalize ${category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.replace('_', ' ')}</span>
          </button>
        ))}
      </div>
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Points</p>
      <input
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        type="number"
        className="mb-4 h-11 w-24 rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Assign to</p>
      <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
        {(members ?? []).map((m) => (
          <button key={m._id} type="button" onClick={() => toggleAssignee(m._id)} className={`rounded-full border px-3 py-1.5 ${assignedTo.includes(m._id) ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs ${assignedTo.includes(m._id) ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{m.name}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={handleSubmit} disabled={createChore.isPending || !title.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
        {createChore.isPending ? 'Creating…' : 'Create Chore'}
      </button>
    </Modal>
  );
}

function ChoreRow({ chore, householdId, members }) {
  const logCompletion = useLogChoreCompletion(householdId);
  const deleteChore = useDeleteChore(householdId);
  const today = dayjs().format('YYYY-MM-DD');
  const assignees = (members ?? []).filter((m) => (chore.assignedTo ?? []).includes(m._id));

  const handleComplete = () => {
    logCompletion.mutate({ id: chore._id, payload: { date: today, status: 'completed', completedBy: assignees[0]?._id } });
  };

  return (
    <div className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex-1">
        <p className="text-base font-semibold text-gray-900 dark:text-white">{chore.title}</p>
        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
          {chore.category.replace('_', ' ')} · {chore.points} pts {assignees.length ? `· ${assignees.map((a) => a.name).join(', ')}` : ''}
        </p>
      </div>
      <button type="button" onClick={handleComplete} className="mr-2" aria-label="Complete chore">
        <Icon name="checkmark-circle-outline" size={24} color="#22c55e" />
      </button>
      <button type="button" onClick={() => deleteChore.mutate(chore._id)} aria-label="Delete chore">
        <Icon name="trash-outline" size={20} color="#94a3b8" />
      </button>
    </div>
  );
}

export function ChoresScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const [tab, setTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const { data: chores, isLoading } = useChores(householdId, { isActive: true });
  const { data: members } = useFamilyMembers(householdId);
  const { data: leaderboard } = useChoreLeaderboard(householdId, {});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Chores</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex-1 rounded-lg py-1.5 ${tab === t.key ? 'bg-white dark:bg-gray-800' : ''}`}>
              <span className={`text-xs font-semibold ${tab === t.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'list' ? (
          !isLoading && (chores ?? []).length === 0 ? (
            <EmptyState icon="checkbox-outline" title="No chores yet" description="Add a chore and assign it to a family member." ctaLabel="Add chore" onCtaPress={() => setShowForm(true)} />
          ) : (
            (chores ?? []).map((c) => <ChoreRow key={c._id} chore={c} householdId={householdId} members={members} />)
          )
        ) : (leaderboard ?? []).length === 0 ? (
          <EmptyState icon="trophy-outline" title="No completed chores yet" description="Complete some chores to see the leaderboard." />
        ) : (
          (leaderboard ?? []).map((entry, idx) => (
            <div key={entry.memberId} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
              <div className="flex flex-row items-center">
                <span className="mr-3 text-lg font-bold text-gray-400 dark:text-gray-500">#{idx + 1}</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">{entry.name}</span>
              </div>
              <span className="text-sm font-medium text-primary-600">{entry.totalPoints} pts</span>
            </div>
          ))
        )}
      </PageContainer>

      <ChoreFormModal visible={showForm} onClose={() => setShowForm(false)} householdId={householdId} members={members} />
    </Screen>
  );
}
