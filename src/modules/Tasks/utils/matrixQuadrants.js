export const MATRIX_QUADRANTS = [
  { key: 'do', label: 'Do First', importance: 'high', urgency: 'high', color: '#ef4444', icon: 'flash-outline' },
  { key: 'schedule', label: 'Schedule', importance: 'high', urgency: 'low', color: '#3b82f6', icon: 'calendar-outline' },
  { key: 'delegate', label: 'Delegate', importance: 'low', urgency: 'high', color: '#f59e0b', icon: 'people-outline' },
  { key: 'eliminate', label: 'Eliminate', importance: 'low', urgency: 'low', color: '#64748b', icon: 'trash-outline' },
];

export function resolveQuadrant(task) {
  return MATRIX_QUADRANTS.find((q) => q.importance === task.importance && q.urgency === task.urgency)?.key ?? 'eliminate';
}

// Pure update descriptor, same pattern as boardColumns.getMoveToColumnUpdate
// — importance/urgency are already plain task fields, so "moving" a card is
// just a direct field update, no derived-state ambiguity like the board has.
export function getMoveToQuadrantUpdate(quadrantKey) {
  const quadrant = MATRIX_QUADRANTS.find((q) => q.key === quadrantKey);
  if (!quadrant) return null;
  return { importance: quadrant.importance, urgency: quadrant.urgency };
}
