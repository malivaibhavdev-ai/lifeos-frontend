import dayjs from 'dayjs';

const CELL_SIZE = 12;
const CELL_GAP = 3;

function cellColor(cell, color) {
  if (!cell) return 'transparent';
  if (!cell.scheduled) return '#f3f4f6'; // unscheduled day — faint, not "missed"
  if (cell.isFrozen) return '#93c5fd'; // frozen — distinct from both met/missed
  if (cell.isGoalMet) return color;
  return '#fecaca'; // scheduled and missed
}

// GitHub-contribution-style grid: columns are weeks, rows are weekdays
// (Sun-Sat), color intensity communicates goal-met/missed/frozen/
// unscheduled. `data` is the exact shape buildHeatmap() on the backend
// returns — this component does no date-range logic of its own, the screen
// decides how far back to fetch (see HabitDetailScreen's Week/Month/Year
// zoom, which just changes the query range).
export function HeatmapGrid({ data, color = '#2563eb' }) {
  if (!data || data.length === 0) return null;

  const firstDate = dayjs(data[0].date);
  const leadingBlanks = firstDate.day(); // 0 (Sun) .. 6 (Sat)
  const cells = [...Array(leadingBlanks).fill(null), ...data];

  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      <div
        className="overflow-x-auto"
        role="img"
        aria-label={`Habit completion heatmap, last ${data.length} days`}
      >
        <div className="flex flex-row" style={{ gap: CELL_GAP }}>
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col" style={{ gap: CELL_GAP }}>
              {column.map((cell, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3, backgroundColor: cellColor(cell, color) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-row items-center justify-end">
        <span className="mr-1.5 text-[10px] text-gray-400 dark:text-gray-500">Less</span>
        <div className="flex flex-row" style={{ gap: 3 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#f3f4f6' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#fecaca' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
        </div>
        <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}
