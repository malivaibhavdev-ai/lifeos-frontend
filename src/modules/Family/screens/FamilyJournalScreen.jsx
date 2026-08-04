import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyJournalEntries, useCreateFamilyJournalEntry, useDeleteFamilyJournalEntry } from '../hooks/useFamilyJournal';

function JournalFormModal({ visible, onClose, householdId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createEntry = useCreateFamilyJournalEntry(householdId);

  const handleSubmit = () => {
    if (!content.trim()) return;
    createEntry.mutate(
      { date: dayjs().format('YYYY-MM-DD'), title: title.trim(), content: content.trim() },
      { onSuccess: () => { onClose(); setTitle(''); setContent(''); } }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Journal Entry">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What happened today?"
        rows={5}
        className="mb-4 w-full rounded-xl border border-gray-300 p-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <button type="button" onClick={handleSubmit} disabled={createEntry.isPending || !content.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
        {createEntry.isPending ? 'Saving…' : 'Save Entry'}
      </button>
    </Modal>
  );
}

export function FamilyJournalScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: entries, isLoading } = useFamilyJournalEntries(householdId, {});
  const deleteEntry = useDeleteFamilyJournalEntry(householdId);
  const [showForm, setShowForm] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Family Journal</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && (entries ?? []).length === 0 ? (
          <EmptyState icon="book-outline" title="No journal entries yet" description="Write down family reflections, wins, and lessons." ctaLabel="New entry" onCtaPress={() => setShowForm(true)} />
        ) : (
          (entries ?? []).map((e) => (
            <div key={e._id} className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-row items-center justify-between">
                <span className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{dayjs(e.date).format('MMM D, YYYY')}</span>
                <button type="button" onClick={() => deleteEntry.mutate(e._id)} aria-label="Delete entry">
                  <Icon name="trash-outline" size={16} color="#94a3b8" />
                </button>
              </div>
              {e.title ? <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{e.title}</p> : null}
              <p className="mt-1 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{e.content}</p>
            </div>
          ))
        )}
      </PageContainer>

      <JournalFormModal visible={showForm} onClose={() => setShowForm(false)} householdId={householdId} />
    </Screen>
  );
}
