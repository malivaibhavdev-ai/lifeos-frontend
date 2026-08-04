// Determines which habits belong on the "Today" tab, without re-implementing
// recurrence matching on the client — recurrence-scheduled habits are
// cross-referenced against the Calendar Engine's own occurrence expansion
// (the same RRule-backed logic the unified calendar already uses), reusing
// that engine exactly as intended rather than duplicating it. Flexible
// timesPerPeriod habits have no fixed days at all (see backend
// habitStreak.util.js's getScheduledDateKeySet), so they're always eligible.
export function filterTodayHabits(habits, todayOccurrences) {
  const scheduledHabitIds = new Set((todayOccurrences ?? []).map((o) => o.entityId));
  return habits.filter((habit) => habit.scheduleType === 'timesPerPeriod' || scheduledHabitIds.has(habit._id));
}
