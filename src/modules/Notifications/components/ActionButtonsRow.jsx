const STYLE_CLASSES = {
  primary: 'bg-primary-600 border-primary-600 text-white',
  destructive: 'bg-white border-danger text-danger dark:bg-gray-900',
  default: 'bg-white border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300',
};

export function ActionButtonsRow({ actions, onAction, onSnoozePress }) {
  if (!actions?.length) return null;

  return (
    <div className="mt-3 flex flex-row flex-wrap" style={{ gap: 8 }}>
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => (action.key === 'snooze' ? onSnoozePress?.() : onAction(action.key))}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${STYLE_CLASSES[action.style] ?? STYLE_CLASSES.default}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
