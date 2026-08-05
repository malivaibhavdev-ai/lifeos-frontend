import { NOTIFICATION_FILTERS } from '../constants/notificationConstants';

export function FilterChipsBar({ active, onChange }) {
  return (
    <div className="flex flex-row overflow-x-auto pb-1" style={{ gap: 8 }}>
      {NOTIFICATION_FILTERS.map((filter) => {
        const isSelected = active === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium ${
              isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
