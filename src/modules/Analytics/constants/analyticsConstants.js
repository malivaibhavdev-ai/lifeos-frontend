// Mirrors backend/src/modules/analytics/model/Widget.model.js and
// AlertRule.model.js exactly — keep these lists in sync if the backend
// enums ever change.
export const WIDGET_TYPES = [
  'line', 'bar', 'stackedBar', 'area', 'pie', 'radar', 'heatmap', 'scatter',
  'gauge', 'sparkline', 'kpi', 'table', 'insightList', 'lifeScore', 'correlation', 'timeline',
];

export const TIME_RANGE_PRESETS = ['7d', '30d', '90d', '365d', 'mtd', 'ytd', 'all', 'custom'];

export const ALERT_CONDITIONS = ['below', 'above', 'dropped_by_percent', 'rose_by_percent', 'streak_broken'];

export const AGGREGATIONS = ['sum', 'average', 'min', 'max', 'count', 'latest'];

export function presetToDateRange(preset) {
  const to = new Date();
  const from = new Date();
  switch (preset) {
    case '7d': from.setDate(from.getDate() - 7); break;
    case '30d': from.setDate(from.getDate() - 30); break;
    case '90d': from.setDate(from.getDate() - 90); break;
    case '365d': from.setDate(from.getDate() - 365); break;
    case 'mtd': from.setDate(1); break;
    case 'ytd': from.setMonth(0, 1); break;
    case 'all': from.setFullYear(from.getFullYear() - 10); break;
    default: from.setDate(from.getDate() - 30);
  }
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}
