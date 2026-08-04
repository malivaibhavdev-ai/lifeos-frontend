import { useEffect, useState } from 'react';

function pointFor(cx, cy, radius, angleDeg, value, maxValue) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const r = (Math.max(0, Math.min(maxValue, value)) / maxValue) * radius;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// The Life Wheel — real radar/spider chart on native <svg>, ported from
// mobile RadarChart.js.
export function RadarChart({ axes = [], size = 240, maxValue = 100, color = '#7c3aed' }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const labelColor = isDark ? '#cbd5e1' : '#475569';

  if (axes.length < 3) {
    return (
      <div style={{ height: size }} className="flex items-center justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">Need at least 3 dimensions</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const angleStep = 360 / axes.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const polygonPoints = axes
    .map((axis, i) => {
      const p = pointFor(cx, cy, radius, i * angleStep, axis.value ?? 0, maxValue);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {rings.map((ringScale) => {
          const ringPoints = axes
            .map((_, i) => {
              const p = pointFor(cx, cy, radius, i * angleStep, maxValue * ringScale, maxValue);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return <polygon key={ringScale} points={ringPoints} fill="none" stroke={gridColor} strokeWidth={1} />;
        })}
        {axes.map((_, i) => {
          const p = pointFor(cx, cy, radius, i * angleStep, maxValue, maxValue);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={gridColor} strokeWidth={1} />;
        })}
        <polygon points={polygonPoints} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={2} />
        {axes.map((axis, i) => {
          const p = pointFor(cx, cy, radius, i * angleStep, axis.value ?? 0, maxValue);
          return <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />;
        })}
        {axes.map((axis, i) => {
          const labelPoint = pointFor(cx, cy, radius + 22, i * angleStep, maxValue, maxValue);
          return (
            <text key={i} x={labelPoint.x} y={labelPoint.y} fontSize={10} fill={labelColor} textAnchor="middle">
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
