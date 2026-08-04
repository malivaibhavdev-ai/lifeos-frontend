import { useMemo } from 'react';

// Real bar chart on native <svg> — ported from mobile BarChart.js.
export function BarChart({ data = [], height = 160, color = '#2563eb', barWidth = 20, gap = 12 }) {
  const textColor = '#94a3b8';

  const { bars } = useMemo(() => {
    const values = data.filter((d) => d.value !== null && d.value !== undefined).map((d) => d.value);
    const maxValue = values.length ? Math.max(...values, 0) : 0;
    const padding = 8;
    const usableHeight = height - padding * 2;
    const bars = data.map((d, i) => {
      const barHeight = maxValue > 0 && d.value !== null && d.value !== undefined ? (d.value / maxValue) * usableHeight : 0;
      return { x: i * (barWidth + gap), barHeight, value: d.value, date: d.date };
    });
    return { bars, maxValue };
  }, [data, height, barWidth, gap]);

  if (bars.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">No data for this range</span>
      </div>
    );
  }

  const width = bars.length * (barWidth + gap);

  return (
    <div className="overflow-x-auto">
      <div style={{ width }}>
        <svg width={width} height={height}>
          {bars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={height - 8 - b.barHeight}
              width={barWidth}
              height={Math.max(b.barHeight, b.value ? 2 : 0)}
              rx={4}
              fill={color}
              opacity={b.value === null || b.value === undefined ? 0.15 : 1}
            />
          ))}
        </svg>
        <div className="mt-1 flex flex-row">
          {bars.map((b, i) => (
            <span key={i} className="truncate text-center text-[9px]" style={{ width: barWidth + gap, color: textColor }}>
              {b.date?.slice(5) ?? ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
