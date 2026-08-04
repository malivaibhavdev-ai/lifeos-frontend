// Single source of truth for hex values needed where a plain color string is
// required (SVG stroke, computed alpha backgrounds) instead of a Tailwind
// className. Keep in sync with the `primary`/`gray`/accent scales in
// tailwind.config.js.
export const COLORS = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  primarySoft: '#eff6ff',
  mutedLight: '#64748b',
  mutedDark: '#94a3b8',
  borderLight: '#e2e8f0',
  borderDark: '#334155',
  placeholderLight: '#cbd5e1',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  white: '#ffffff',
};
