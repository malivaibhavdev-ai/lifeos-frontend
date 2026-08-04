import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMemories, useCreateFamilyMemory, useFamilyTimeline } from '../hooks/useFamilyMemories';

const MEMORY_TYPES = ['photo', 'video', 'voice', 'story', 'milestone', 'achievement', 'trip'];
const TABS = [{ key: 'memories', label: 'Memories' }, { key: 'timeline', label: 'Timeline' }];
const TIMELINE_ICON = { event: 'calendar-outline', memory: 'images-outline', birth: 'gift-outline' };

function MemoryFormModal({ visible, onClose, householdId }) {
  const [title, setTitle] = useState('');
  const [memoryType, setMemoryType] = useState('photo');
  const [place, setPlace] = useState('');
  const createMemory = useCreateFamilyMemory(householdId);

  const handleSubmit = () => {
    if (!title.trim()) return;
    createMemory.mutate(
      { date: dayjs().format('YYYY-MM-DD'), title: title.trim(), memoryType, place: place.trim() },
      { onSuccess: () => { onClose(); setTitle(''); setPlace(''); } }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Memory">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Memory title *"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
        {MEMORY_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setMemoryType(t)} className={`rounded-full border px-3 py-1.5 ${memoryType === t ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs capitalize ${memoryType === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t}</span>
          </button>
        ))}
      </div>
      <input
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        placeholder="Place (optional)"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <button type="button" onClick={handleSubmit} disabled={createMemory.isPending || !title.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
        {createMemory.isPending ? 'Saving…' : 'Save Memory'}
      </button>
    </Modal>
  );
}

export function FamilyMemoriesScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const [tab, setTab] = useState('memories');
  const [showForm, setShowForm] = useState(false);
  const { data: memories, isLoading } = useFamilyMemories(householdId, {});
  const { data: timeline } = useFamilyTimeline(householdId, {});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Memories & Timeline</p>
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

        {tab === 'memories' ? (
          !isLoading && (memories ?? []).length === 0 ? (
            <EmptyState icon="images-outline" title="No memories yet" description="Capture your family's special moments." ctaLabel="Add memory" onCtaPress={() => setShowForm(true)} />
          ) : (
            (memories ?? []).map((m) => (
              <div key={m._id} className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{dayjs(m.date).format('MMM D, YYYY')} · {m.memoryType}</p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{m.title}</p>
                {m.place ? <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{m.place}</p> : null}
              </div>
            ))
          )
        ) : (timeline ?? []).length === 0 ? (
          <EmptyState icon="time-outline" title="Nothing here yet" description="Events, memories, and births will show up here chronologically." />
        ) : (
          (timeline ?? []).map((item) => (
            <div key={item.id} className="mb-3 flex flex-row items-center rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
              <Icon name={TIMELINE_ICON[item.kind] ?? 'ellipse-outline'} size={18} color="#2563eb" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{dayjs(item.date).format('MMM D, YYYY')}</p>
              </div>
            </div>
          ))
        )}
      </PageContainer>

      <MemoryFormModal visible={showForm} onClose={() => setShowForm(false)} householdId={householdId} />
    </Screen>
  );
}
