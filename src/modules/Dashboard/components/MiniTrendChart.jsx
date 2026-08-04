// Small bar-sparkline for the Finance widget's real net-worth trend — same
// bar-per-point technique the full-size NetWorthScreen trend chart uses,
// just shrunk down and fed fewer points.
export function MiniTrendChart({ trend, height = 36, pointCount = 14 }) {
  if (!Array.isArray(trend) || trend.length < 2) return null;

  const points = trend.slice(-pointCount).filter((t) => t && typeof t.netWorthBase === 'number');
  if (points.length < 2) return null;

  const max = Math.max(...points.map((t) => Math.abs(t.netWorthBase)), 1);

  return (
    <div className="mt-3 flex flex-row items-end" style={{ height }}>
      {points.map((t, i) => (
        <div
          key={t.date ?? i}
          className="mx-0.5 flex-1 rounded-t bg-primary-500 dark:bg-primary-400"
          style={{ height: Math.max(2, (Math.abs(t.netWorthBase) / max) * height) }}
        />
      ))}
    </div>
  );
}
