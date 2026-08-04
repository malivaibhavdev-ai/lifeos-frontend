const DEFAULT_COLORS = ['#2563eb', '#7c3aed', '#0d9488', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#06b6d4'];

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

// Real donut/pie chart on native <svg> — ported from mobile PieChart.js.
export function PieChart({ data = [], size = 160, innerRadiusRatio = 0.6, showLegend = true }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div style={{ height: size }} className="flex items-center justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">No data</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const innerR = r * innerRadiusRatio;

  let angle = 0;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 360;
    const slice = { ...d, startAngle: angle, endAngle: angle + sliceAngle, color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] };
    angle += sliceAngle;
    return slice;
  });

  return (
    <div className="flex flex-row items-center" style={{ gap: 16 }}>
      <svg width={size} height={size}>
        {slices.map((s, i) => (
          <path key={i} d={arcPath(cx, cy, r, s.startAngle, s.endAngle)} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r={innerR} fill="transparent" />
      </svg>
      {showLegend ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} className="flex flex-row items-center" style={{ gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">{s.label} ({Math.round((s.value / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
