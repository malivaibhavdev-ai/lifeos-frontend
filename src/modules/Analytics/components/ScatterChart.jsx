import { useMemo } from 'react';

// Real scatter plot for correlation visualization — ported from mobile
// ScatterChart.js. Doubles as a bubble chart via `sizeKey`.
export function ScatterChart({ points = [], width = 280, height = 200, color = '#2563eb', sizeKey }) {
  const gridColor = '#e5e7eb';
  const textColor = '#94a3b8';

  const { plotted, xMin, xMax, yMin, yMax } = useMemo(() => {
    if (points.length === 0) return { plotted: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    const padding = 16;

    const sizes = sizeKey ? points.map((p) => p[sizeKey] ?? 0) : [];
    const maxSize = sizes.length ? Math.max(...sizes, 1) : 1;

    const plotted = points.map((p) => ({
      cx: padding + ((p.x - xMin) / xRange) * (width - padding * 2),
      cy: height - padding - ((p.y - yMin) / yRange) * (height - padding * 2),
      r: sizeKey ? 3 + (p[sizeKey] / maxSize) * 9 : 4,
    }));
    return { plotted, xMin, xMax, yMin, yMax };
  }, [points, width, height, sizeKey]);

  if (plotted.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">No paired data points</span>
      </div>
    );
  }

  return (
    <div>
      <svg width={width} height={height}>
        <line x1={16} y1={height - 16} x2={width - 16} y2={height - 16} stroke={gridColor} strokeWidth={1} />
        <line x1={16} y1={16} x2={16} y2={height - 16} stroke={gridColor} strokeWidth={1} />
        {plotted.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={color} fillOpacity={0.6} stroke={color} strokeWidth={1} />
        ))}
      </svg>
      <div className="mt-1 flex flex-row items-center justify-between">
        <span className="text-[10px]" style={{ color: textColor }}>x: {xMin}–{xMax}</span>
        <span className="text-[10px]" style={{ color: textColor }}>y: {yMin}–{yMax}</span>
      </div>
    </div>
  );
}
