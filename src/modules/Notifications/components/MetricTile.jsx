export function MetricTile({ label, value, suffix = '', color = '#2563eb' }) {
  return (
    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-2xl font-bold" style={{ color }}>
        {value ?? '—'}
        {value != null ? suffix : ''}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
