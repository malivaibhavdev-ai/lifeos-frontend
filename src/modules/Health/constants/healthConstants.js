// Mirrors backend enums across all Phase 8 Health sub-modules — plain
// string maps, same convention as every other module's constants file.
export const MOOD = {
  terrible: { key: 'terrible', label: 'Terrible', emoji: '😢' },
  bad: { key: 'bad', label: 'Bad', emoji: '🙁' },
  okay: { key: 'okay', label: 'Okay', emoji: '😐' },
  good: { key: 'good', label: 'Good', emoji: '🙂' },
  great: { key: 'great', label: 'Great', emoji: '😄' },
};
export const MOOD_ORDER = ['terrible', 'bad', 'okay', 'good', 'great'];

export const WORKOUT_TYPES = [
  'Strength', 'Cardio', 'Yoga', 'Running', 'Cycling', 'Swimming', 'Walking', 'General',
];

export const WORKOUT_INTENSITY = {
  low: { key: 'low', label: 'Low', color: '#22c55e' },
  medium: { key: 'medium', label: 'Medium', color: '#f59e0b' },
  high: { key: 'high', label: 'High', color: '#ef4444' },
};

export const SLEEP_QUALITY = {
  poor: { key: 'poor', label: 'Poor', color: '#ef4444' },
  fair: { key: 'fair', label: 'Fair', color: '#f59e0b' },
  good: { key: 'good', label: 'Good', color: '#22c55e' },
  excellent: { key: 'excellent', label: 'Excellent', color: '#2563eb' },
};

export const MEAL_TYPES = {
  breakfast: { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  lunch: { key: 'lunch', label: 'Lunch', icon: 'partly-sunny-outline' },
  dinner: { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  snack: { key: 'snack', label: 'Snack', icon: 'cafe-outline' },
};
export const MEAL_TYPES_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEDICINE_FORMS = {
  tablet: { key: 'tablet', label: 'Tablet', icon: 'ellipse-outline' },
  capsule: { key: 'capsule', label: 'Capsule', icon: 'medical-outline' },
  liquid: { key: 'liquid', label: 'Liquid', icon: 'water-outline' },
  injection: { key: 'injection', label: 'Injection', icon: 'medkit-outline' },
  topical: { key: 'topical', label: 'Topical', icon: 'hand-left-outline' },
  other: { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
};
export const MEDICINE_FORMS_ORDER = ['tablet', 'capsule', 'liquid', 'injection', 'topical', 'other'];

export const MEDICINE_LOG_STATUS = {
  pending: { key: 'pending', label: 'Pending', color: '#94a3b8' },
  taken: { key: 'taken', label: 'Taken', color: '#22c55e' },
  missed: { key: 'missed', label: 'Missed', color: '#ef4444' },
  skipped: { key: 'skipped', label: 'Skipped', color: '#f59e0b' },
};

export const HEALTH_COLORS = ['#2563eb', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
