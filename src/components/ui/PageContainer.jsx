// Shared responsive reading-column wrapper. The mobile app's screens were
// designed for a single phone-width column; on a wide desktop viewport that
// same column stretched edge-to-edge reads as broken, not "responsive". This
// re-centers that same column with breathing room on either side instead of
// stretching it — the mobile layout itself is untouched (same flex-col
// stack, same spacing), it's just no longer full-bleed on wide screens.
// Intentionally NOT used by views that should genuinely use the full width
// on desktop (Kanban board, Calendar grids, wide data tables) — those get
// more columns/density at `lg:`/`xl:` instead of being width-capped.
export function PageContainer({ children, className = '', maxWidth = 'max-w-5xl' }) {
  return <div className={`mx-auto w-full ${maxWidth} px-4 py-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
