import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useNoteList, useNoteMeta, useTrashNote, useRestoreNote, useDestroyNote, useUpdateNote } from '../hooks/useNotes';
import { useNotebookList } from '../hooks/useNotebooks';
import { useNoteUiStore } from '../store/noteUiStore';
import { NoteCard } from '../components/NoteCard';
import { NotebookCard } from '../components/NotebookCard';
import { NotebookFormSheet } from '../components/NotebookFormSheet';
import { TagChips } from '../components/TagChips';

const TABS = [
  { key: 'notes', label: 'Notes' },
  { key: 'notebooks', label: 'Notebooks' },
];

const VIEWS = [
  { key: 'active', label: 'Active', icon: 'document-text-outline' },
  { key: 'archived', label: 'Archived', icon: 'archive-outline' },
  { key: 'trash', label: 'Trash', icon: 'trash-outline' },
];

export function NotesWorkspaceScreen() {
  const navigate = useNavigate();
  const workspaceTab = useNoteUiStore((s) => s.workspaceTab);
  const setWorkspaceTab = useNoteUiStore((s) => s.setWorkspaceTab);
  const notebookFilter = useNoteUiStore((s) => s.notebookFilter);
  const setNotebookFilter = useNoteUiStore((s) => s.setNotebookFilter);

  const [view, setView] = useState('active');
  const [tagFilter, setTagFilter] = useState(null);
  const [actionNote, setActionNote] = useState(null);
  const [notebookSheet, setNotebookSheet] = useState(null); // { notebook } | { new: true } | null

  const { data: notesData, isLoading } = useNoteList({ view, notebook: notebookFilter || undefined, tag: tagFilter || undefined });
  const notes = notesData?.items ?? EMPTY_ARRAY;
  const { data: meta } = useNoteMeta();
  const { data: notebooksData } = useNotebookList({});
  const notebooks = notebooksData ?? EMPTY_ARRAY;

  const notebookNoteCounts = useMemo(() => {
    const counts = new Map();
    for (const n of notes) {
      if (!n.notebook) continue;
      counts.set(n.notebook, (counts.get(n.notebook) ?? 0) + 1);
    }
    return counts;
  }, [notes]);

  const trashNote = useTrashNote();
  const restoreNote = useRestoreNote();
  const destroyNote = useDestroyNote();
  const updateNote = useUpdateNote();

  const handleOpenNote = useCallback((note) => navigate(`/notes/${note._id}`), [navigate]);
  const handleNewNote = useCallback(
    (noteType = 'note') => navigate('/notes/new', { state: { noteType, notebookId: notebookFilter } }),
    [navigate, notebookFilter]
  );
  const handleOpenNotebook = useCallback(
    (notebook) => {
      setNotebookFilter(notebook._id);
      setWorkspaceTab('notes');
    },
    [setNotebookFilter, setWorkspaceTab]
  );
  const handleEditNotebook = useCallback((notebook) => setNotebookSheet({ notebook }), []);

  const renderNotesTab = () => (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="mx-4 mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {VIEWS.map((v) => (
          <button
            type="button"
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex-1 items-center rounded-lg py-1.5 ${view === v.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <span className={`text-xs font-semibold ${view === v.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {notebooks.length > 0 ? (
        <div className="mb-2 px-4">
          <TagChips
            tags={notebooks.map((nb) => nb.name)}
            selected={notebookFilter ? [notebooks.find((nb) => nb._id === notebookFilter)?.name] : []}
            onToggle={(name) => {
              if (name === null) return setNotebookFilter(null);
              const nb = notebooks.find((n) => n.name === name);
              setNotebookFilter(notebookFilter === nb?._id ? null : nb?._id ?? null);
            }}
            allowAll
            allSelected={!notebookFilter}
          />
        </div>
      ) : null}

      {meta?.tags?.length > 0 ? (
        <div className="mb-3 px-4">
          <TagChips
            tags={meta.tags}
            selected={tagFilter ? [tagFilter] : []}
            onToggle={(tag) => setTagFilter(tagFilter === tag ? null : tag)}
          />
        </div>
      ) : null}

      {!isLoading && notes.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title={view === 'trash' ? 'Trash is empty' : 'No notes yet'}
          description={view === 'active' ? 'Capture your first thought, idea, or reference.' : undefined}
          ctaLabel={view === 'active' ? 'New Note' : undefined}
          onCtaPress={view === 'active' ? () => handleNewNote() : undefined}
        />
      ) : (
        notes.map((note) => <NoteCard key={note._id} note={note} onPress={handleOpenNote} onLongPress={setActionNote} />)
      )}
    </div>
  );

  const renderNotebooksTab = () => (
    <div className="flex-1 overflow-y-auto pb-6 pt-1">
      {notebooks.length === 0 ? (
        <EmptyState
          icon="library-outline"
          title="No notebooks yet"
          description="Group related notes into a notebook."
          ctaLabel="New Notebook"
          onCtaPress={() => setNotebookSheet({ new: true })}
        />
      ) : (
        notebooks.map((nb) => (
          <NotebookCard
            key={nb._id}
            notebook={nb}
            noteCount={notebookNoteCounts.get(nb._id)}
            onPress={handleOpenNotebook}
            onLongPress={handleEditNotebook}
          />
        ))
      )}
    </div>
  );

  const isTrashView = view === 'trash';

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
      <div className="-mx-4 flex flex-1 min-h-0 flex-col sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Notes</p>
        <div className="flex flex-row items-center">
          <button
            type="button"
            onClick={() => navigate('/notes/search')}
            aria-label="Search"
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
          >
            <Icon name="search-outline" size={18} color="#2563eb" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/notes/daily')}
            aria-label="Daily note"
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
          >
            <Icon name="book-outline" size={18} color="#2563eb" />
          </button>
          <button
            type="button"
            onClick={() => (workspaceTab === 'notebooks' ? setNotebookSheet({ new: true }) : handleNewNote())}
            aria-label={workspaceTab === 'notebooks' ? 'New notebook' : 'New note'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600"
          >
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>
      </div>

      <div className="mx-4 mb-3 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setWorkspaceTab(tab.key)}
            className={`flex-1 items-center rounded-lg py-1.5 ${workspaceTab === tab.key ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            <span className={`text-xs font-semibold ${workspaceTab === tab.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col">{workspaceTab === 'notebooks' ? renderNotebooksTab() : renderNotesTab()}</div>
      </div>
      </PageContainer>

      <NotebookFormSheet
        visible={Boolean(notebookSheet)}
        notebook={notebookSheet?.notebook ?? null}
        onClose={() => setNotebookSheet(null)}
      />

      <Modal visible={Boolean(actionNote)} onClose={() => setActionNote(null)} title={actionNote?.title ?? ''}>
        {isTrashView ? (
          <>
            <button
              type="button"
              onClick={() => {
                restoreNote.mutate(actionNote._id);
                setActionNote(null);
              }}
              className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
            >
              <Icon name="arrow-undo-outline" size={19} color="#64748b" />
              <span className="ml-3 text-base text-gray-900 dark:text-white">Restore</span>
            </button>
            <button
              type="button"
              onClick={() => {
                destroyNote.mutate(actionNote._id);
                setActionNote(null);
              }}
              className="flex w-full flex-row items-center py-3.5"
            >
              <Icon name="trash-outline" size={19} color="#ef4444" />
              <span className="ml-3 text-base text-danger">Delete Forever</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                handleOpenNote(actionNote);
                setActionNote(null);
              }}
              className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
            >
              <Icon name="create-outline" size={19} color="#64748b" />
              <span className="ml-3 text-base text-gray-900 dark:text-white">Open</span>
            </button>
            <button
              type="button"
              onClick={() => {
                updateNote.mutate({ id: actionNote._id, payload: { isPinned: !actionNote.isPinned } });
                setActionNote(null);
              }}
              className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
            >
              <Icon name="bookmark-outline" size={19} color="#64748b" />
              <span className="ml-3 text-base text-gray-900 dark:text-white">{actionNote?.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                updateNote.mutate({ id: actionNote._id, payload: { isArchived: !actionNote.isArchived } });
                setActionNote(null);
              }}
              className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
            >
              <Icon name="archive-outline" size={19} color="#64748b" />
              <span className="ml-3 text-base text-gray-900 dark:text-white">{actionNote?.isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                trashNote.mutate(actionNote._id);
                setActionNote(null);
              }}
              className="flex w-full flex-row items-center py-3.5"
            >
              <Icon name="trash-outline" size={19} color="#ef4444" />
              <span className="ml-3 text-base text-danger">Move to Trash</span>
            </button>
          </>
        )}
      </Modal>
    </Screen>
  );
}
