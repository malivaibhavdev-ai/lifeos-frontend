import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { useCreateMeditation, useDeleteMeditation, useMeditationList, useMeditationStreak } from '../hooks/useMeditation';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const DURATIONS = [5, 10, 15, 20];

const MeditationRow = memo(function MeditationRow({ session, onDelete }) {
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.type}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{dayjs(session.date).format('MMM D, YYYY')}</p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm font-bold text-purple-600">{session.durationMinutes}m</span>
        <button type="button" aria-label="Delete session" onContextMenu={(e) => { e.preventDefault(); onDelete(session._id); }} onClick={() => onDelete(session._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function MeditationScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: streak } = useMeditationStreak();
  const { data: history } = useMeditationList({ limit: 30 });
  const createMeditation = useCreateMeditation();
  const deleteMeditation = useDeleteMeditation();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('Guided');
  const [durationMinutes, setDurationMinutes] = useState('10');

  const items = history?.items ?? EMPTY_ARRAY;

  const handleLog = (minutes) => {
    createMeditation.mutate({ date: today, type, durationMinutes: minutes });
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Meditation</p>
        <button type="button" aria-label="Custom session" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="mx-4 mb-4 flex flex-row items-center justify-center rounded-2xl bg-white py-5 dark:bg-gray-900">
        <Icon name="flame" size={22} color="#f59e0b" />
        <p className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">{streak?.currentStreak ?? 0}</p>
        <p className="ml-1.5 text-sm text-gray-500 dark:text-gray-400">day streak</p>
      </div>

      <p className="mb-2 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Quick log</p>
      <div className="mb-4 flex flex-row flex-wrap justify-center gap-3 px-4">
        {DURATIONS.map((minutes) => (
          <button
            type="button"
            key={minutes}
            onClick={() => handleLog(minutes)}
            className="flex w-20 flex-col items-center rounded-2xl border border-purple-200 bg-purple-50 py-3 dark:border-purple-900 dark:bg-purple-950"
          >
            <Icon name="flower" size={18} color="#a855f7" />
            <span className="mt-1 text-sm font-semibold text-purple-700 dark:text-purple-300">{minutes}m</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="flower-outline" title="No sessions yet" description="Log a meditation session to start your streak." />
        ) : (
          items.map((session) => <MeditationRow key={session._id} session={session} onDelete={deleteMeditation.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={() => { handleLog(Number(durationMinutes) || 10); setShowForm(false); }} title="Custom Session">
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Breathing, Body Scan, Guided…"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes)</p>
          <input
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
      </Modal>
    </Screen>
  );
}
