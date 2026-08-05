// Same aria-pressed pill-button idiom Documents' AutomationRulesScreen
// uses for booleans on web (no native <Switch> primitive in this app —
// mobile's is RN-only) — kept generic so every boolean toggle across this
// module's web screens looks identical.
export function ToggleButton({ label, value, onChange }) {
  return (
    <div className={label ? 'flex flex-row items-center justify-between py-2.5' : 'inline-flex'}>
      {label ? <span className="text-[15px] text-gray-900 dark:text-white">{label}</span> : null}
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          value ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
        }`}
      >
        {value ? 'On' : 'Off'}
      </button>
    </div>
  );
}
