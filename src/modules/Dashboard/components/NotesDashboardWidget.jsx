import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useNoteList } from '../../Notes/hooks/useNotes';
import { useDailyNote, useWritingStreak } from '../../Notes/hooks/useJournal';
import { Icon } from '../../../components/ui/Icon';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

export function NotesDashboardWidget() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const { data: dailyNote } = useDailyNote(today);
  const { data: streak } = useWritingStreak();
  const { data: notesData } = useNoteList({ view: 'active' });
  const notes = notesData?.items ?? EMPTY_ARRAY;

  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3),
    [notes]
  );
  const pinnedNotes = useMemo(() => notes.filter((n) => n.isPinned).slice(0, 3), [notes]);

  if (notes.length === 0 && !dailyNote?.content) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
      <button type="button" onClick={() => navigate('/notes')} className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-2.5 h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#0ea5e920' }}>
            <Icon name="document-text" size={16} color="#0ea5e9" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white">Notes</p>
        </div>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </button>

      <div className="mt-3 flex flex-row items-center justify-around">
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{notes.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center">
            <Icon name="flame" size={14} color="#f59e0b" />
            <p className="ml-1 text-lg font-bold text-amber-500">{streak?.currentStreak ?? 0}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Writing streak</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/notes/daily')}
        className="mt-3 flex w-full flex-row items-center rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800"
      >
        <Icon name="book-outline" size={16} color="#2563eb" />
        <span className="ml-2 flex-1 truncate text-left text-sm text-gray-700 dark:text-gray-300">
          {dailyNote?.content ? "Continue today's Daily Note" : "Write today's Daily Note"}
        </span>
        <Icon name="chevron-forward" size={14} color="#94a3b8" />
      </button>

      {pinnedNotes.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">PINNED</p>
          {pinnedNotes.map((note) => (
            <button
              key={note._id}
              type="button"
              onClick={() => navigate(`/notes/${note._id}`)}
              className="flex w-full flex-row items-center py-1.5 text-left"
            >
              <Icon name="bookmark" size={12} color="#2563eb" />
              <span className="ml-2 flex-1 truncate text-sm text-gray-800 dark:text-gray-200">{note.title}</span>
            </button>
          ))}
        </div>
      ) : recentNotes.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">RECENT</p>
          {recentNotes.map((note) => (
            <button
              key={note._id}
              type="button"
              onClick={() => navigate(`/notes/${note._id}`)}
              className="flex w-full flex-row items-center py-1.5 text-left"
            >
              <Icon name="document-text-outline" size={12} color="#94a3b8" />
              <span className="ml-2 flex-1 truncate text-sm text-gray-800 dark:text-gray-200">{note.title}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
