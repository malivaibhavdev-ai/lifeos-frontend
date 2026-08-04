import { PRIORITY, PRIORITY_ORDER } from '../constants/taskConstants';

export function PrioritySelector({ value, onChange }) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {PRIORITY_ORDER.map((key) => {
        const priority = PRIORITY[key];
        const isSelected = value === key;
        return (
          <button
            type="button"
            key={key}
            onClick={() => onChange(isSelected ? 'medium' : key)}
            aria-pressed={isSelected}
            className="flex flex-row items-center rounded-full border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            style={{
              backgroundColor: isSelected ? priority.color : 'transparent',
              borderColor: priority.color,
            }}
          >
            <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: isSelected ? '#fff' : priority.color }} />
            <span className="text-sm font-medium" style={{ color: isSelected ? '#fff' : priority.color }}>
              {priority.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
