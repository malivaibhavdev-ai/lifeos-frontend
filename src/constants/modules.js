// Central registry of module metadata (icon/title/description) shared by the
// sidebar/drawer and each module's placeholder screen, so the two never drift.
export const MODULES = {
  tasks: { key: 'tasks', title: 'Tasks', description: 'Plan, track, and complete your to-dos.', icon: 'checkbox-outline' },
  calendar: { key: 'calendar', title: 'Calendar', description: 'See your schedule and upcoming events.', icon: 'calendar-outline' },
  focus: { key: 'focus', title: 'Focus', description: 'Pomodoro, deep focus, and stopwatch sessions.', icon: 'timer-outline' },
  health: { key: 'health', title: 'Health', description: 'Track your daily health score and vitals.', icon: 'heart-outline' },
  sleep: { key: 'sleep', title: 'Sleep', description: 'Log and analyze your sleep patterns.', icon: 'moon-outline' },
  workout: { key: 'workout', title: 'Workout', description: 'Plan workouts and track your fitness progress.', icon: 'barbell-outline' },
  finance: { key: 'finance', title: 'Finance', description: 'Track income, expenses, budgets, and investments.', icon: 'wallet-outline' },
  habits: { key: 'habits', title: 'Habits', description: 'Build and maintain daily habits.', icon: 'repeat-outline' },
  goals: { key: 'goals', title: 'Goals', description: 'Set goals and track your progress toward them.', icon: 'flag-outline' },
  journal: { key: 'journal', title: 'Journal', description: 'Write and reflect on your daily journal entries.', icon: 'book-outline' },
  notes: { key: 'notes', title: 'Notes', description: 'Capture and organize your notes.', icon: 'document-text-outline' },
  dreams: { key: 'dreams', title: 'Dreams', description: 'Record, analyze, and understand your dreams.', icon: 'moon-outline' },
  career: { key: 'career', title: 'Career', description: 'Track your career milestones and learning.', icon: 'briefcase-outline' },
  family: { key: 'family', title: 'Family', description: 'Manage your household together — members, chores, events, and more.', icon: 'people-outline' },
  documents: { key: 'documents', title: 'Documents', description: 'Your document operating system — folders, OCR, versions, sharing, and automation.', icon: 'folder-outline' },
  analytics: { key: 'analytics', title: 'Analytics', description: 'Your Life Score, trends, correlations, insights, and custom dashboards across every module.', icon: 'stats-chart-outline' },
  notifications: { key: 'notifications', title: 'Notifications', description: 'Manage your reminders and alerts.', icon: 'notifications-outline' },
  settings: { key: 'settings', title: 'Settings', description: 'Configure app preferences and security.', icon: 'settings-outline' },
  profile: { key: 'profile', title: 'Profile', description: 'View and manage your account.', icon: 'person-circle-outline' },
};

// Items shown in the More menu / sidebar, in display order. Profile/Settings
// sit at the bottom since they're account-level rather than life-tracking modules.
export const MORE_MENU_ORDER = [
  'focus',
  'health',
  'sleep',
  'workout',
  'habits',
  'goals',
  'journal',
  'notes',
  'dreams',
  'career',
  'family',
  'documents',
  'analytics',
  'notifications',
  'settings',
  'profile',
];

// Route path for each module screen, mirroring the mobile app's route names
// but as web URL paths.
export const MODULE_ROUTES = {
  focus: '/focus',
  health: '/health',
  sleep: '/health/sleep-log',
  workout: '/health/workout-log',
  habits: '/habits',
  goals: '/goals',
  journal: '/notes/daily',
  notes: '/notes',
  dreams: '/dreams',
  career: '/career',
  family: '/family',
  documents: '/documents',
  analytics: '/analytics',
  notifications: '/notifications',
  settings: '/settings',
  profile: '/profile',
};
