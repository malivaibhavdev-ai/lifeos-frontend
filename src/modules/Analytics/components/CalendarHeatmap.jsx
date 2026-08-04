const CELL_SIZE = 12;
const CELL_GAP = 3;

function intensityBucket(value, max) {
  if (value === null || value === undefined || max === 0) return 0;
  const ratio = value / max;
  if (ratio <= 0) return 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

function shadeFor(bucket, color) {
  if (bucket === 0) return '#f3f4f6';
  const opacities = [0, 0.35, 0.55, 0.75, 1];
  return `${color}${Math.round(opacities[bucket] * 255).toString(16).padStart(2, '0')}`;
}

// Generalized GitHub-contribution-style grid — ported from mobile
// CalendarHeatmap.js.
export function CalendarHeatmap({ data = [], color = '#2563eb' }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value ?? 0), 0);
  const firstDate = new Date(data[0].date);
  const leadingBlanks = firstDate.getDay();
  const cells = [...Array(leadingBlanks).fill(null), ...data];

  const columns = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex flex-row" style={{ gap: CELL_GAP }}>
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col" style={{ gap: CELL_GAP }}>
              {column.map((cell, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: 3,
                    backgroundColor: cell ? shadeFor(intensityBucket(cell.value, max), color) : 'transparent',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-row items-center justify-end">
        <span className="mr-1.5 text-[10px] text-gray-400 dark:text-gray-500">Less</span>
        <div className="flex flex-row" style={{ gap: 3 }}>
          {[0, 1, 2, 3, 4].map((bucket) => (
            <div key={bucket} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: shadeFor(bucket, color) }} />
          ))}
        </div>
        <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}
