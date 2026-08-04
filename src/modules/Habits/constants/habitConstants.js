// Mirrors backend/src/modules/habits/model/Habit.model.js's enums — plain
// string maps on both sides, not a shared package, matching how Focus's
// FOCUS_MODES mirrors its own backend constants.
export const HABIT_TYPE = {
  build: { key: 'build', label: 'Build Habit', icon: 'trending-up-outline', description: 'Form a new positive habit' },
  quit: { key: 'quit', label: 'Quit Habit', icon: 'close-circle-outline', description: 'Break away from something' },
  routine: { key: 'routine', label: 'Routine Step', icon: 'list-outline', description: 'Part of a daily routine' },
  challenge: { key: 'challenge', label: 'Challenge', icon: 'trophy-outline', description: 'A time-bound challenge' },
  tracking: { key: 'tracking', label: 'Tracking Only', icon: 'analytics-outline', description: 'Just for visibility, no pressure' },
};
export const HABIT_TYPE_ORDER = ['build', 'quit', 'routine', 'challenge', 'tracking'];

export const TRACKING_TYPE = {
  boolean: { key: 'boolean', label: 'Yes / No', icon: 'checkmark-circle-outline' },
  quantity: { key: 'quantity', label: 'Quantity', icon: 'stats-chart-outline' },
  time: { key: 'time', label: 'Duration', icon: 'time-outline' },
};
export const TRACKING_TYPE_ORDER = ['boolean', 'quantity', 'time'];

export const SCHEDULE_TYPE = {
  recurrence: { key: 'recurrence', label: 'Fixed schedule' },
  timesPerPeriod: { key: 'timesPerPeriod', label: 'X times per period' },
};

export const PERIOD_UNIT = {
  week: { key: 'week', label: 'week' },
  month: { key: 'month', label: 'month' },
};

export const ROUTINE_TIME_OF_DAY = {
  morning: { key: 'morning', label: 'Morning', icon: 'sunny-outline' },
  afternoon: { key: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline' },
  evening: { key: 'evening', label: 'Evening', icon: 'moon-outline' },
  custom: { key: 'custom', label: 'Custom', icon: 'list-outline' },
};
export const ROUTINE_TIME_OF_DAY_ORDER = ['morning', 'afternoon', 'evening', 'custom'];

export const HABIT_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

// Common unit suggestions for quantity/time habits — a starting point in the
// picker UI, not a closed set (the field is free text on both ends).
export const UNIT_SUGGESTIONS = ['L', 'ml', 'glasses', 'steps', 'pages', 'minutes', 'reps', 'km'];
