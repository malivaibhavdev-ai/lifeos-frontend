import { useMemo } from 'react';

// A tiny inline trend line for widget/KPI cards — ported from mobile
// Sparkline.js.
export function Sparkline({ data = [], width = 80, height = 28, color = '#2563eb' }) {
  const path = useMemo(() => {
    const values = data.filter((d) => d.value !== null && d.value !== undefined).map((d) => d.value);
    if (values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    let d = '';
    let penDown = false;
    data.forEach((point, i) => {
      if (point.value === null || point.value === undefined) {
        penDown = false;
        return;
      }
      const x = i * stepX;
      const y = height - ((point.value - min) / range) * height;
      d += `${penDown ? 'L' : 'M'} ${x} ${y} `;
      penDown = true;
    });
    return d;
  }, [data, width, height]);

  if (!path) return <div style={{ width, height }} />;

  return (
    <svg width={width} height={height}>
      <path d={path} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
