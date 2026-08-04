import { memo } from 'react';
import { Icon } from '../../../components/ui/Icon';

// Memoized: rendered in a `.map()` loop on the Notes workspace (Notebooks
// tab). `onLongPress` opens the edit sheet directly and previously had no
// visible affordance outside right-click — see NoteCard for the same fix.
export const NotebookCard = memo(function NotebookCard({ notebook, noteCount, onPress, onLongPress }) {
  const color = notebook.color ?? '#2563eb';

  return (
    <div className="group relative mx-4 mb-2.5 w-[calc(100%-2rem)]">
      <button
        type="button"
        onClick={() => onPress?.(notebook)}
        onContextMenu={(e) => {
          if (!onLongPress) return;
          e.preventDefault();
          onLongPress(notebook);
        }}
        className={`flex w-full flex-row items-center rounded-2xl bg-white p-3.5 text-left shadow-sm dark:bg-gray-900 ${onLongPress ? 'pr-10' : ''}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon name={notebook.icon || 'library-outline'} size={18} color={color} />
        </div>
        <div className="ml-3 flex-1 overflow-hidden">
          <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{notebook.name}</p>
          {typeof noteCount === 'number' ? (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{noteCount} notes</p>
          ) : null}
        </div>
        <Icon name="chevron-forward" size={16} color="#cbd5e1" />
      </button>

      {onLongPress ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLongPress(notebook);
          }}
          aria-label={`Edit ${notebook.name}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 dark:bg-gray-800"
        >
          <Icon name="create-outline" size={14} color="#64748b" />
        </button>
      ) : null}
    </div>
  );
});
