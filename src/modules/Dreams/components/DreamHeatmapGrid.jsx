import dayjs from 'dayjs';

const CELL_SIZE = 12;
const CELL_GAP = 3;

const NONE_COLOR = '#f3f4f6';
const NORMAL_COLOR = '#a78bfa';
const LUCID_COLOR = '#22c55e';
const NIGHTMARE_COLOR = '#f87171';

function cellColor(cell) {
  if (!cell) return 'transparent';
  if (!cell.hasEntry) return NONE_COLOR;
  if (cell.isNightmare) return NIGHTMARE_COLOR;
  if (cell.isLucid) return LUCID_COLOR;
  return NORMAL_COLOR;
}

// Web port of the mobile DreamHeatmapGrid — same GitHub-contribution-style
// grid, colored by dream density/lucid/nightmare. `data`:
// [{ date, hasEntry, isLucid, isNightmare }], oldest first.
export function DreamHeatmapGrid({ data }) {
  if (!data || data.length === 0) return null;

  const firstDate = dayjs(data[0].date);
  const leadingBlanks = firstDate.day();
  const cells = [...Array(leadingBlanks).fill(null), ...data];

  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      <div className="overflow-x-auto" role="img" aria-label={`Dream heatmap, last ${data.length} days`}>
        <div className="flex flex-row" style={{ gap: CELL_GAP }}>
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col" style={{ gap: CELL_GAP }}>
              {column.map((cell, rowIndex) => (
                <div key={rowIndex} style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3, backgroundColor: cellColor(cell) }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-row items-center justify-end" style={{ gap: 10 }}>
        <div className="flex flex-row items-center" style={{ gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: NORMAL_COLOR }} />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Dream</span>
        </div>
        <div className="flex flex-row items-center" style={{ gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: LUCID_COLOR }} />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Lucid</span>
        </div>
        <div className="flex flex-row items-center" style={{ gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: NIGHTMARE_COLOR }} />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Nightmare</span>
        </div>
      </div>
    </div>
  );
}
