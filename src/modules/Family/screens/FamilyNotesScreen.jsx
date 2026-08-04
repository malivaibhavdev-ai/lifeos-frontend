import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyNotes, useCreateFamilyNote, useDeleteFamilyNote } from '../hooks/useFamilyNotes';

const CATEGORIES = ['note', 'announcement', 'discussion'];

function NoteFormModal({ visible, onClose, householdId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('note');
  const [isPinned, setIsPinned] = useState(false);
  const createNote = useCreateFamilyNote(householdId);

  const handleSubmit = () => {
    if (!content.trim()) return;
    createNote.mutate(
      { title: title.trim(), content: content.trim(), category, isPinned },
      { onSuccess: () => { onClose(); setTitle(''); setContent(''); setIsPinned(false); } }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Note">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <div className="mb-4 flex flex-row" style={{ gap: 6 }}>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1.5 ${category === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs capitalize ${category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c}</span>
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        rows={4}
        className="mb-4 w-full rounded-xl border border-gray-300 p-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <label className="mb-4 flex flex-row items-center">
        <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-5 w-5 accent-primary-600" />
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Pin this note</span>
      </label>
      <button type="button" onClick={handleSubmit} disabled={createNote.isPending || !content.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
        {createNote.isPending ? 'Saving…' : 'Save Note'}
      </button>
    </Modal>
  );
}

export function FamilyNotesScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: notes, isLoading } = useFamilyNotes(householdId, {});
  const deleteNote = useDeleteFamilyNote(householdId);
  const [showForm, setShowForm] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Shared Notes</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && (notes ?? []).length === 0 ? (
          <EmptyState icon="document-text-outline" title="No notes yet" description="Share announcements, ideas, or discussion topics with your family." ctaLabel="New note" onCtaPress={() => setShowForm(true)} />
        ) : (
          (notes ?? []).map((n) => (
            <div key={n._id} className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                  {n.isPinned ? <Icon name="pin" size={14} color="#f59e0b" style={{ marginRight: 6 }} /> : null}
                  <span className="text-xs font-medium capitalize text-gray-400 dark:text-gray-500">{n.category}</span>
                </div>
                <button type="button" onClick={() => deleteNote.mutate(n._id)} aria-label="Delete note">
                  <Icon name="trash-outline" size={16} color="#94a3b8" />
                </button>
              </div>
              {n.title ? <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{n.title}</p> : null}
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{n.content}</p>
            </div>
          ))
        )}
      </PageContainer>

      <NoteFormModal visible={showForm} onClose={() => setShowForm(false)} householdId={householdId} />
    </Screen>
  );
}
