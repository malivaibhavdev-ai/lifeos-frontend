import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { DateField } from '../../../components/ui/DateField';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useCreateNote, useUpdateNote, useTrashNote, useNote, useNoteList, useNoteMeta, useUploadNoteAttachment } from '../hooks/useNotes';
import { useCreateKnowledgeLink, useDeleteKnowledgeLink, useLinksForOwner } from '../hooks/useKnowledgeLinks';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { MarkdownPreview, extractWikiLinkTitles } from '../components/MarkdownPreview';
import { BacklinksPanel } from '../components/BacklinksPanel';
import { LinkPickerSheet } from '../components/LinkPickerSheet';
import { TagChips } from '../components/TagChips';

const AUTOSAVE_DELAY_MS = 900;

export function NoteEditorScreen() {
  const navigate = useNavigate();
  const { noteId: routeParamNoteId } = useParams();
  const location = useLocation();
  const routeNoteId = routeParamNoteId && routeParamNoteId !== 'new' ? routeParamNoteId : undefined;
  const { noteType: initialNoteType = 'note', notebookId = null } = location.state ?? {};

  const [noteId, setNoteId] = useState(routeNoteId ?? null);
  const { data: existingNote, isLoading } = useNote(noteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [reminderAt, setReminderAt] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const [showMenu, setShowMenu] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [showReminderField, setShowReminderField] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const trashNote = useTrashNote();
  const uploadAttachment = useUploadNoteAttachment();
  const { data: meta } = useNoteMeta();
  const { data: allNotesData } = useNoteList({ view: 'active' });
  const allNotes = allNotesData?.items ?? EMPTY_ARRAY;
  const notesById = useMemo(() => new Map(allNotes.map((n) => [String(n._id), n.title])), [allNotes]);
  const notesByTitle = useMemo(() => new Map(allNotes.map((n) => [n.title.trim().toLowerCase(), n])), [allNotes]);

  const createKnowledgeLink = useCreateKnowledgeLink();
  const deleteKnowledgeLink = useDeleteKnowledgeLink();
  const { data: existingWikiLinks } = useLinksForOwner('note', noteId);

  // Hydrate local state from the server once (on load, or on switching to
  // an existing note) — after that, this screen is the source of truth
  // until it unmounts, autosave pushes local state outward.
  useEffect(() => {
    if (routeNoteId && existingNote && !hydratedRef.current) {
      setTitle(existingNote.title ?? '');
      setContent(existingNote.content ?? '');
      setTags(existingNote.tags ?? []);
      setIsPinned(Boolean(existingNote.isPinned));
      setReminderAt(existingNote.reminderAt ? new Date(existingNote.reminderAt) : null);
      setAttachments(existingNote.attachments ?? []);
      hydratedRef.current = true;
    }
  }, [routeNoteId, existingNote]);

  const buildPayload = () => ({
    title: title.trim() || 'Untitled',
    content,
    tags,
    isPinned,
    reminderAt: reminderAt ? reminderAt.toISOString() : null,
    attachments,
    noteType: initialNoteType,
    notebook: notebookId,
  });

  // Reconciles [[wiki links]] found in content against KnowledgeLink —
  // only resolves to notes that already exist by title match; an
  // unresolved [[link]] just renders as inert text until a matching note
  // is created (no auto-create-on-link, to keep this a predictable,
  // explicit action rather than a surprising side effect of typing).
  const syncWikiLinks = (savedNoteId, latestContent) => {
    const titles = extractWikiLinkTitles(latestContent);
    const resolvedIds = new Set(
      titles.map((t) => notesByTitle.get(t.trim().toLowerCase())?._id).filter((id) => id && id !== savedNoteId)
    );
    const currentLinkedIds = new Set((existingWikiLinks ?? []).filter((l) => l.linkedType === 'note').map((l) => String(l.linkedId)));

    for (const id of resolvedIds) {
      if (!currentLinkedIds.has(String(id))) {
        createKnowledgeLink.mutate({ ownerType: 'note', ownerId: savedNoteId, linkedType: 'note', linkedId: id });
      }
    }
    for (const link of existingWikiLinks ?? []) {
      if (link.linkedType === 'note' && !resolvedIds.has(String(link.linkedId))) {
        deleteKnowledgeLink.mutate({ ownerType: 'note', ownerId: savedNoteId, linkedType: 'note', linkedId: link.linkedId });
      }
    }
  };

  const save = () => {
    const payload = buildPayload();
    if (noteId) {
      updateNote.mutate({ id: noteId, payload }, { onSuccess: () => syncWikiLinks(noteId, payload.content) });
    } else if (title.trim() || content.trim()) {
      createNote.mutate(payload, {
        onSuccess: (created) => {
          if (created && !created.queued) {
            setNoteId(created._id);
            hydratedRef.current = true;
            syncWikiLinks(created._id, payload.content);
          }
        },
      });
    }
  };

  // Debounced autosave — the premium "just keep writing" experience,
  // no explicit Save button anywhere in this screen.
  useEffect(() => {
    if (!hydratedRef.current && routeNoteId) return; // don't save over unloaded data
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(saveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, isPinned, reminderAt, attachments]);

  const handleBack = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      save();
    }
    navigate(-1);
  };

  const handleAddTag = () => {
    const tag = newTagText.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setNewTagText('');
  };

  const handlePickAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    uploadAttachment.mutate(file, { onSuccess: (attachment) => setAttachments((prev) => [...prev, attachment]) });
  };

  const handleWikiLinkPress = (targetTitle) => {
    const match = notesByTitle.get(targetTitle.trim().toLowerCase());
    if (match) navigate(`/notes/${match._id}`);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (!noteId) return navigate(-1);
    trashNote.mutate(noteId, { onSuccess: () => navigate(-1) });
  };

  if (routeNoteId && isLoading && !hydratedRef.current) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageContainer maxWidth="max-w-4xl" className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-1 min-h-0 flex-col -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" onClick={handleBack} aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <div className="flex flex-row items-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="mr-4 lg:hidden"
            aria-label="Toggle preview"
          >
            <Icon name={mode === 'edit' ? 'eye-outline' : 'create-outline'} size={22} color="#64748b" />
          </button>
          <button type="button" onClick={() => setIsPinned((p) => !p)} className="mr-4" aria-label="Toggle pin">
            <Icon name={isPinned ? 'bookmark' : 'bookmark-outline'} size={22} color={isPinned ? '#2563eb' : '#64748b'} />
          </button>
          <button type="button" onClick={() => setShowMenu(true)} aria-label="Note actions">
            <Icon name="ellipsis-horizontal" size={22} color="#64748b" />
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        aria-label="Note title"
        className="mx-4 mb-2 bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
      />

      <div className="mx-4 mb-2 flex flex-row flex-wrap items-center">
        {tags.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setTags(tags.filter((t) => t !== tag))}
            className="mb-1.5 mr-1.5 flex flex-row items-center rounded-full bg-primary-50 px-2.5 py-1 dark:bg-primary-950"
          >
            <span className="text-xs font-medium text-primary-600">#{tag}</span>
            <Icon name="close" size={11} color="#2563eb" style={{ marginLeft: 4 }} />
          </button>
        ))}
        <input
          value={newTagText}
          onChange={(e) => setNewTagText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTag();
          }}
          placeholder="+ tag"
          aria-label="Add tag"
          className="mb-1.5 w-20 bg-transparent text-xs text-gray-500 outline-none placeholder:text-gray-400 dark:text-gray-400"
        />
      </div>

      {meta?.tags?.length > 0 ? (
        <div className="mb-2 px-4">
          <TagChips tags={meta.tags.filter((t) => !tags.includes(t))} selected={[]} onToggle={(tag) => setTags([...tags, tag])} />
        </div>
      ) : null}

      {/* Below `lg:` this toggles between editor and preview (via `mode`),
          matching the mobile app's single-pane behavior. At `lg:` and up
          there's enough width for a Notion/Obsidian-style side-by-side
          editor+preview split, so both panes render at once and the toggle
          button above is hidden (nothing left for it to toggle). */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div className={`min-h-0 flex-1 flex-col lg:flex lg:border-r lg:border-gray-100 dark:lg:border-gray-800 ${mode === 'edit' ? 'flex' : 'hidden'}`}>
          <MarkdownEditor value={content} onChangeText={setContent} />
        </div>
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-4 lg:block ${mode === 'preview' ? 'block' : 'hidden'}`}
        >
          <MarkdownPreview content={content} onWikiLinkPress={handleWikiLinkPress} />
        </div>
      </div>

      {attachments.length > 0 ? (
        <div className="flex flex-row overflow-x-auto border-t border-gray-100 px-4 py-2 dark:border-gray-800" style={{ flexGrow: 0 }}>
          {attachments.map((a, i) => (
            <div key={a._id ?? i} className="mr-2 flex flex-shrink-0 flex-row items-center rounded-lg bg-gray-100 px-2.5 py-1.5 dark:bg-gray-800">
              <Icon name="attach-outline" size={13} color="#64748b" />
              <span className="ml-1 truncate text-xs text-gray-600 dark:text-gray-300" style={{ maxWidth: 100 }}>
                {a.fileName}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {noteId ? (
        <div className="border-t border-gray-100 px-4 pb-6 pt-3 dark:border-gray-800">
          <div className="mb-2 flex flex-row items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Backlinks</span>
            <button type="button" onClick={() => setShowLinkPicker(true)} className="flex flex-row items-center">
              <Icon name="link-outline" size={14} color="#2563eb" />
              <span className="ml-1 text-xs font-semibold text-primary-600">Link items</span>
            </button>
          </div>
          <BacklinksPanel linkedType="note" linkedId={noteId} notesById={notesById} onPressBacklink={() => {}} />
        </div>
      ) : null}

      {showReminderField ? (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <DateField label="Reminder" value={reminderAt} onChange={setReminderAt} mode="datetime" />
        </div>
      ) : null}

      {noteId ? (
        <LinkPickerSheet visible={showLinkPicker} ownerType="note" ownerId={noteId} excludeNoteId={noteId} onClose={() => setShowLinkPicker(false)} />
      ) : null}
      </div>
      </PageContainer>

      <label htmlFor="note-attachment-input" className="sr-only">Attach file</label>
      <input id="note-attachment-input" ref={fileInputRef} type="file" onChange={handleFileSelected} className="sr-only" />

      <Modal visible={showMenu} onClose={() => setShowMenu(false)} title={title || 'Untitled'}>
        <button
          type="button"
          onClick={() => {
            setShowMenu(false);
            setShowReminderField((v) => !v);
          }}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
        >
          <Icon name="alarm-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">{reminderAt ? 'Edit reminder' : 'Add reminder'}</span>
        </button>
        <button
          type="button"
          onClick={handlePickAttachment}
          className="flex w-full flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
        >
          <Icon name="attach-outline" size={19} color="#64748b" />
          <span className="ml-3 text-base text-gray-900 dark:text-white">Add attachment</span>
        </button>
        <button type="button" onClick={handleDelete} className="flex w-full flex-row items-center py-3.5">
          <Icon name="trash-outline" size={19} color="#ef4444" />
          <span className="ml-3 text-base text-danger">Move to Trash</span>
        </button>
      </Modal>
    </Screen>
  );
}
