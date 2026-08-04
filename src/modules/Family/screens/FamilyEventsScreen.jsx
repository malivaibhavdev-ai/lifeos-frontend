import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyEvents, useCreateFamilyEvent, useDeleteFamilyEvent } from '../hooks/useFamilyEvents';

const EVENT_TYPES = ['birthday', 'anniversary', 'gathering', 'vacation', 'religious', 'school', 'sports', 'doctor_visit', 'meeting', 'custom'];

function EventFormModal({ visible, onClose, householdId }) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('gathering');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const createEvent = useCreateFamilyEvent(householdId);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const startTime = new Date(`${date}T09:00:00`).toISOString();
    createEvent.mutate({ title: title.trim(), eventType, startTime, endTime: startTime }, { onSuccess: () => { onClose(); setTitle(''); } });
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Event">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title *"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
      <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
        {EVENT_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setEventType(t)} className={`rounded-full border px-3 py-1.5 ${eventType === t ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs capitalize ${eventType === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t.replace('_', ' ')}</span>
          </button>
        ))}
      </div>
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
      <input
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="YYYY-MM-DD"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <button type="button" onClick={handleSubmit} disabled={createEvent.isPending || !title.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
        {createEvent.isPending ? 'Creating…' : 'Create Event'}
      </button>
    </Modal>
  );
}

export function FamilyEventsScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: events, isLoading } = useFamilyEvents(householdId, {});
  const deleteEvent = useDeleteFamilyEvent(householdId);
  const [showForm, setShowForm] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Family Events</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && (events ?? []).length === 0 ? (
          <EmptyState icon="calendar-outline" title="No events yet" description="Add a family gathering, vacation, or celebration." ctaLabel="New event" onCtaPress={() => setShowForm(true)} />
        ) : (
          (events ?? []).map((e) => (
            <div key={e._id} className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 dark:text-white">{e.title}</p>
                <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{e.eventType.replace('_', ' ')} · {dayjs(e.startTime).format('MMM D, YYYY')}</p>
              </div>
              <button type="button" onClick={() => deleteEvent.mutate(e._id)} aria-label="Delete event">
                <Icon name="trash-outline" size={18} color="#94a3b8" />
              </button>
            </div>
          ))
        )}
      </PageContainer>

      <EventFormModal visible={showForm} onClose={() => setShowForm(false)} householdId={householdId} />
    </Screen>
  );
}
