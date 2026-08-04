import { useEffect, useMemo, useState } from 'react';

// Real, hand-rolled line/area chart on native <svg> — same construction
// as the mobile LineChart.js (react-native-svg), ported to plain SVG
// elements since no charting library exists in this web app either.
export function LineChart({ data = [], height = 160, color = '#2563eb', showArea = true, formatLabel }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const gridColor = isDark ? '#334155' : '#e5e7eb';
  const textColor = '#94a3b8';

  const { points, minValue, maxValue, width } = useMemo(() => {
    const width = Math.max(280, data.length * 36);
    const values = data.filter((d) => d.value !== null && d.value !== undefined).map((d) => d.value);
    if (values.length === 0) return { points: [], minValue: 0, maxValue: 0, width };
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;
    const padding = 12;
    const usableHeight = height - padding * 2;

    const points = data.map((d, i) => {
      if (d.value === null || d.value === undefined) return { x: i * stepX, y: null };
      const y = padding + usableHeight - ((d.value - minValue) / range) * usableHeight;
      return { x: i * stepX, y, value: d.value, date: d.date };
    });
    return { points, minValue, maxValue, width };
  }, [data, height]);

  if (points.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">No data for this range</span>
      </div>
    );
  }

  const segments = [];
  let current = [];
  for (const p of points) {
    if (p.y === null) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push(p);
    }
  }
  if (current.length) segments.push(current);

  const linePathFor = (segment) => segment.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPathFor = (segment) => {
    if (segment.length === 0) return '';
    const last = segment[segment.length - 1];
    return `${linePathFor(segment)} L ${last.x} ${height} L ${segment[0].x} ${height} Z`;
  };

  return (
    <div>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.25} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={gridColor} strokeWidth={1} strokeDasharray="4,4" />
        {segments.map((segment, i) => (
          <path key={`area-${i}`} d={showArea ? areaPathFor(segment) : ''} fill={showArea ? 'url(#areaGradient)' : 'none'} />
        ))}
        {segments.map((segment, i) => (
          <path key={`line-${i}`} d={linePathFor(segment)} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {points.filter((p) => p.y !== null).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex flex-row items-center justify-between">
        <span className="text-[10px]" style={{ color: textColor }}>{formatLabel ? formatLabel(minValue) : minValue}</span>
        <span className="text-[10px]" style={{ color: textColor }}>{formatLabel ? formatLabel(maxValue) : maxValue}</span>
      </div>
    </div>
  );
}
