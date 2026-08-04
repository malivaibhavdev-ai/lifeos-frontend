import { memo } from 'react';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { NOTE_TYPES } from '../constants/noteConstants';

function plainSnippet(content, max = 90) {
  if (!content) return '';
  const clean = content.replace(/[#*_`>[\]]/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

// Memoized: rendered in a `.map()` loop on the Notes workspace. `onLongPress`
// (Pin/Archive/Trash or Restore/Delete Forever menu) previously had no
// visible affordance outside right-click — a hover-revealed (always-visible
// on touch) "more options" button now exposes the same action.
export const NoteCard = memo(function NoteCard({ note, onPress, onLongPress }) {
  const typeMeta = NOTE_TYPES[note.noteType] ?? NOTE_TYPES.note;

  return (
    <div className="group relative mx-4 mb-2.5 w-[calc(100%-2rem)]">
      <button
        type="button"
        onClick={() => onPress?.(note)}
        onContextMenu={(e) => {
          if (!onLongPress) return;
          e.preventDefault();
          onLongPress(note);
        }}
        className={`flex w-full flex-col rounded-2xl bg-white p-3.5 text-left shadow-sm dark:bg-gray-900 ${onLongPress ? 'pr-9' : ''}`}
      >
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-1 flex-row items-center overflow-hidden">
            <Icon name={typeMeta.icon} size={14} color="#94a3b8" />
            <span className="ml-2 flex-1 truncate text-base font-semibold text-gray-900 dark:text-white">
              {note.title || 'Untitled'}
            </span>
          </div>
          {note.isPinned ? <Icon name="bookmark" size={14} color="#2563eb" /> : null}
        </div>

        {note.content ? (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{plainSnippet(note.content)}</p>
        ) : null}

        <div className="mt-2 flex flex-row items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">{dayjs(note.updatedAt).format('MMM D, YYYY')}</span>
          {note.tags?.length > 0 ? (
            <div className="ml-2 flex flex-row flex-wrap">
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="ml-1 text-xs text-primary-600">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </button>

      {onLongPress ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLongPress(note);
          }}
          aria-label={`More options for ${note.title || 'Untitled'}`}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 dark:bg-gray-800"
        >
          <Icon name="ellipsis-horizontal" size={14} color="#64748b" />
        </button>
      ) : null}
    </div>
  );
});
