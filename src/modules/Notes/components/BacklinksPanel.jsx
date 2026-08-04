import { Icon } from '../../../components/ui/Icon';
import { useBacklinks } from '../hooks/useKnowledgeLinks';

// "What links to this note" — reverse lookup on KnowledgeLink. `notesById`
// is a plain Map<id,title> the parent screen builds from its already-
// fetched notes list, so this panel doesn't need to fire its own N+1
// lookups just to show titles.
export function BacklinksPanel({ linkedType, linkedId, notesById = new Map(), onPressBacklink }) {
  const { data: backlinks } = useBacklinks(linkedType, linkedId);

  if (!backlinks || backlinks.length === 0) {
    return <p className="px-4 text-xs text-gray-400 dark:text-gray-500">No backlinks yet.</p>;
  }

  return (
    <div className="px-4">
      {backlinks.map((link) => {
        const title = link.ownerType === 'note' ? notesById.get(String(link.ownerId)) ?? 'Untitled note' : 'Daily Note';
        return (
          <button
            type="button"
            key={link._id}
            onClick={() => onPressBacklink?.(link)}
            className="mb-1.5 flex w-full flex-row items-center rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900"
          >
            <Icon name="return-up-back-outline" size={14} color="#94a3b8" />
            <span className="ml-2 flex-1 truncate text-left text-sm text-gray-700 dark:text-gray-300">{title}</span>
            {link.context ? (
              <span className="ml-2 max-w-[40%] truncate text-xs text-gray-400 dark:text-gray-500">"{link.context}"</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
