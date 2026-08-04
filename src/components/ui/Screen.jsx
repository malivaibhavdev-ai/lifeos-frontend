// Web replacement for the mobile Screen wrapper — SafeAreaView/
// KeyboardAvoidingView have no web equivalent (no notch/inset or on-screen
// keyboard reflow concept on desktop), so this is just the background +
// scroll behavior.
export function Screen({ children, scroll = false, className = '' }) {
  return (
    <div className={`flex-1 min-h-0 bg-surface-light dark:bg-surface-dark flex flex-col ${className}`}>
      <div className={`flex-1 min-h-0 flex flex-col ${scroll ? 'overflow-y-auto' : ''}`}>{children}</div>
    </div>
  );
}
