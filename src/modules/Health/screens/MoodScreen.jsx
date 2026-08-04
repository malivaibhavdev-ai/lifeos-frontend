import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { MOOD, MOOD_ORDER } from '../constants/healthConstants';
import { useCreateMood, useDeleteMood, useMoodList } from '../hooks/useMood';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const MoodRow = memo(function MoodRow({ item, onDelete }) {
  const meta = MOOD[item.mood];
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <span className="text-2xl">{meta.emoji}</span>
      <div className="ml-3 min-w-0 flex-1">
        <p className="text-base font-semibold text-gray-900 dark:text-white">{meta.label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{dayjs(item.date).format('MMM D, YYYY')}</p>
        {item.note ? <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{item.note}</p> : null}
      </div>
      <button type="button" aria-label="Delete mood entry" onContextMenu={(e) => { e.preventDefault(); onDelete(item._id); }} onClick={() => onDelete(item._id)} className="p-1">
        <Icon name="trash-outline" size={16} color="#ef4444" />
      </button>
    </div>
  );
});

export function MoodScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: history } = useMoodList({ limit: 30 });
  const createMood = useCreateMood();
  const deleteMood = useDeleteMood();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [note, setNote] = useState('');

  const items = history?.items ?? EMPTY_ARRAY;

  const handleSave = () => {
    if (!mood) return;
    createMood.mutate(
      { date: today, mood, energyLevel, stressLevel, note: note.trim() || undefined },
      { onSuccess: () => { setShowForm(false); setMood(null); setNote(''); } }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Mood</p>
        <button type="button" aria-label="Log mood" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="happy-outline" title="No mood check-ins yet" description="Log how you're feeling to spot patterns over time." />
        ) : (
          items.map((item) => <MoodRow key={item._id} item={item} onDelete={deleteMood.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Mood">
        <div className="mb-4 flex flex-row justify-between">
          {MOOD_ORDER.map((key) => {
            const meta = MOOD[key];
            const isSelected = mood === key;
            return (
              <button
                type="button"
                key={key}
                aria-label={meta.label}
                aria-pressed={isSelected}
                onClick={() => setMood(key)}
                className={`flex h-14 w-14 items-center justify-center rounded-full ${isSelected ? 'bg-primary-100 dark:bg-primary-900' : ''}`}
              >
                <span style={{ fontSize: isSelected ? 30 : 24 }}>{meta.emoji}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Energy level ({energyLevel})</p>
          <div className="flex flex-row items-center gap-2">
            <button type="button" aria-label="Decrease energy level" onClick={() => setEnergyLevel(Math.max(1, energyLevel - 1))} className="rounded-full border border-gray-300 p-2 dark:border-gray-700">
              <Icon name="remove" size={16} color="#2563eb" />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${energyLevel * 10}%` }} />
            </div>
            <button type="button" aria-label="Increase energy level" onClick={() => setEnergyLevel(Math.min(10, energyLevel + 1))} className="rounded-full border border-gray-300 p-2 dark:border-gray-700">
              <Icon name="add" size={16} color="#2563eb" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Stress level ({stressLevel})</p>
          <div className="flex flex-row items-center gap-2">
            <button type="button" aria-label="Decrease stress level" onClick={() => setStressLevel(Math.max(1, stressLevel - 1))} className="rounded-full border border-gray-300 p-2 dark:border-gray-700">
              <Icon name="remove" size={16} color="#2563eb" />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${stressLevel * 10}%` }} />
            </div>
            <button type="button" aria-label="Increase stress level" onClick={() => setStressLevel(Math.min(10, stressLevel + 1))} className="rounded-full border border-gray-300 p-2 dark:border-gray-700">
              <Icon name="add" size={16} color="#2563eb" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[60px] w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
      </Modal>
    </Screen>
  );
}
