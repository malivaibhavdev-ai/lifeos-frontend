import { memo } from 'react';
import { getFocusPreset } from '../../Focus/constants/focusModes';
import { ENTITY_DEFAULTS, getBlockLayout, resolveColor } from '../utils/occurrenceHelpers';

function resolveTitle(occurrence) {
  if (occurrence.title) return occurrence.title;
  if (occurrence.entityType === 'focusSession') return getFocusPreset(occurrence.meta?.mode).label;
  return ENTITY_DEFAULTS[occurrence.entityType]?.label ?? 'Event';
}

// Absolutely positioned within the Day/Week grid's hour canvas — top/height
// come from the occurrence's own time range, left/width from its
// column/columnCount (set by assignOverlapColumns for same-time occurrences
// that need to render side by side, Google-Calendar-style).
//
// Wrapped in React.memo: DayView/WeekView both memoize the laid-out
// occurrence array (assignOverlapColumns) and the day's Date object, and
// CalendarWorkspaceScreen's onOpenOccurrence is `useCallback`-wrapped, so a
// re-render of the grid for an unrelated reason (e.g. a sheet opening
// elsewhere) no longer re-renders every block on the day/week grid.
export const OccurrenceBlock = memo(function OccurrenceBlock({ occurrence, dayDate, onPress }) {
  const { top, height } = getBlockLayout(occurrence, dayDate);
  const color = resolveColor(occurrence);
  const columnCount = occurrence.columnCount ?? 1;
  const column = occurrence.column ?? 0;
  const widthPercent = 100 / columnCount;

  return (
    <button
      type="button"
      onClick={() => onPress(occurrence)}
      className="flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:z-10"
      style={{
        position: 'absolute',
        top,
        height: Math.max(height - 2, 20),
        left: `${column * widthPercent}%`,
        width: `${widthPercent}%`,
        paddingRight: 2,
      }}
    >
      <div
        className={`flex flex-1 flex-col justify-start overflow-hidden rounded-lg px-2 py-1 ${occurrence.isCompleted ? 'opacity-50' : ''}`}
        style={{ backgroundColor: `${color}26`, borderLeftWidth: 3, borderLeftColor: color }}
      >
        <span
          className={`${height > 34 ? 'line-clamp-2' : 'line-clamp-1'} text-xs font-semibold ${occurrence.isCompleted ? 'line-through' : ''}`}
          style={{ color }}
        >
          {resolveTitle(occurrence)}
        </span>
      </div>
    </button>
  );
});
