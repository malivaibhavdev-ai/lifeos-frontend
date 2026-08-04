// Generic tag chip row — used both as a read-only filter row (workspace)
// and a toggleable multi-select row (note editor tag picker), depending on
// whether `onToggle` treats `tags` as "all known tags" or "selected tags".
export function TagChips({ tags, selected, onToggle, allowAll = false, allSelected = false }) {
  return (
    <div className="flex flex-row overflow-x-auto" style={{ flexGrow: 0 }}>
      {allowAll ? (
        <button
          type="button"
          onClick={() => onToggle(null)}
          className={`mr-2 flex-shrink-0 rounded-full border px-3.5 py-2 ${allSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
        >
          <span className={`text-sm font-medium ${allSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>All</span>
        </button>
      ) : null}
      {tags.map((tag) => {
        const isSelected = selected?.includes(tag);
        return (
          <button
            type="button"
            key={tag}
            onClick={() => onToggle(tag)}
            className={`mr-2 flex-shrink-0 rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>#{tag}</span>
          </button>
        );
      })}
    </div>
  );
}
