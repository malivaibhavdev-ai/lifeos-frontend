// Tiny cross-view bridge: the QuickAddBar lives once in the workspace shell
// (outside any individual view), but several views (List's empty-state CTA,
// Board's empty column, ...) want to focus it. A ref can't cross that
// boundary cleanly since views are meant to be self-sufficient and not
// receive shell-specific props — this module-level indirection is simpler
// than threading a ref/callback through the view registry.
let focusFn = null;

export function registerQuickAddFocus(fn) {
  focusFn = fn;
}

export function focusQuickAdd() {
  focusFn?.();
}
