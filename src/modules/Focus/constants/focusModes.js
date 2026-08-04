// Mirrors backend/src/modules/focusSessions/constants/focusConstants.js —
// both sides agree on the same mode keys as plain strings, not a shared
// enum, so a new mode is a config addition on each side, never a migration.
export const FOCUS_MODES = {
  POMODORO: 'pomodoro',
  DEEP_FOCUS: 'deepFocus',
  STOPWATCH: 'stopwatch',
  COUNTDOWN: 'countdown',
};

// One engine (useFocusTimer), four presets — Deep Focus is "Pomodoro
// without the interruptions", Stopwatch counts up with no target, Countdown
// is a single count-down phase for a user-chosen duration.
export const FOCUS_MODE_PRESETS = {
  [FOCUS_MODES.POMODORO]: {
    label: 'Pomodoro',
    icon: 'timer-outline',
    workSeconds: 25 * 60,
    shortBreakSeconds: 5 * 60,
    longBreakSeconds: 15 * 60,
    cyclesBeforeLongBreak: 4,
    hasBreaks: true,
    isCountUp: false,
    isCustomDuration: false,
  },
  [FOCUS_MODES.DEEP_FOCUS]: {
    label: 'Deep Focus',
    icon: 'moon-outline',
    workSeconds: 50 * 60,
    shortBreakSeconds: 10 * 60,
    longBreakSeconds: 10 * 60,
    cyclesBeforeLongBreak: 1,
    hasBreaks: false,
    isCountUp: false,
    isCustomDuration: false,
  },
  [FOCUS_MODES.STOPWATCH]: {
    label: 'Stopwatch',
    icon: 'stopwatch-outline',
    workSeconds: null,
    hasBreaks: false,
    isCountUp: true,
    isCustomDuration: false,
  },
  [FOCUS_MODES.COUNTDOWN]: {
    label: 'Countdown',
    icon: 'hourglass-outline',
    workSeconds: null, // supplied per-session by the user
    hasBreaks: false,
    isCountUp: false,
    isCustomDuration: true,
  },
};

export function getFocusPreset(mode) {
  return FOCUS_MODE_PRESETS[mode] ?? FOCUS_MODE_PRESETS[FOCUS_MODES.POMODORO];
}
