// Mirrors backend/src/modules/goals/constants/goalConstants.js — plain
// string maps on both sides, same convention as Habits' HABIT_TYPE mirroring
// its own backend enum.
export const GOAL_TYPES = {
  personal: { key: 'personal', label: 'Personal', icon: 'person-outline' },
  career: { key: 'career', label: 'Career', icon: 'briefcase-outline' },
  health: { key: 'health', label: 'Health', icon: 'fitness-outline' },
  finance: { key: 'finance', label: 'Finance', icon: 'cash-outline' },
  learning: { key: 'learning', label: 'Learning', icon: 'school-outline' },
  business: { key: 'business', label: 'Business', icon: 'trending-up-outline' },
  relationship: { key: 'relationship', label: 'Relationship', icon: 'heart-outline' },
  travel: { key: 'travel', label: 'Travel', icon: 'airplane-outline' },
  custom: { key: 'custom', label: 'Custom', icon: 'ellipse-outline' },
};
export const GOAL_TYPES_ORDER = [
  'personal', 'career', 'health', 'finance', 'learning', 'business', 'relationship', 'travel', 'custom',
];

export const PROGRESS_MODES = {
  manual: { key: 'manual', label: 'Manual', description: 'You update progress yourself' },
  automatic: { key: 'automatic', label: 'Automatic', description: 'Derived from Key Results' },
  weighted: { key: 'weighted', label: 'Weighted', description: 'A weighted blend of tasks, habits, milestones & time' },
  task_based: { key: 'task_based', label: 'Task-based', description: 'Driven by linked task completion' },
  habit_based: { key: 'habit_based', label: 'Habit-based', description: 'Driven by linked habit consistency' },
  milestone_based: { key: 'milestone_based', label: 'Milestone-based', description: 'Driven by milestone/project completion' },
  time_based: { key: 'time_based', label: 'Time-based', description: 'Driven by elapsed time to target date' },
  mixed: { key: 'mixed', label: 'Mixed', description: 'A blend of everything linked' },
};
export const PROGRESS_MODES_ORDER = [
  'manual', 'automatic', 'weighted', 'task_based', 'habit_based', 'milestone_based', 'time_based', 'mixed',
];

export const GOAL_STATUS = {
  not_started: { key: 'not_started', label: 'Not Started', color: '#94a3b8' },
  in_progress: { key: 'in_progress', label: 'In Progress', color: '#2563eb' },
  completed: { key: 'completed', label: 'Completed', color: '#22c55e' },
  abandoned: { key: 'abandoned', label: 'Abandoned', color: '#64748b' },
};

export const PROJECT_STATUS = {
  not_started: { key: 'not_started', label: 'Not Started', color: '#94a3b8' },
  in_progress: { key: 'in_progress', label: 'In Progress', color: '#2563eb' },
  completed: { key: 'completed', label: 'Completed', color: '#22c55e' },
  on_hold: { key: 'on_hold', label: 'On Hold', color: '#f59e0b' },
  abandoned: { key: 'abandoned', label: 'Abandoned', color: '#64748b' },
};

export const MILESTONE_STATUS = {
  not_started: { key: 'not_started', label: 'Not Started', color: '#94a3b8' },
  in_progress: { key: 'in_progress', label: 'In Progress', color: '#2563eb' },
  completed: { key: 'completed', label: 'Completed', color: '#22c55e' },
  missed: { key: 'missed', label: 'Missed', color: '#ef4444' },
};

export const COMPLETION_RULES = {
  manual: { key: 'manual', label: 'Manual' },
  all_tasks_complete: { key: 'all_tasks_complete', label: 'All linked tasks complete' },
  any_task_complete: { key: 'any_task_complete', label: 'Any linked task complete' },
};

export const GOAL_HEALTH = {
  ahead: { key: 'ahead', label: 'Ahead', color: '#22c55e' },
  on_track: { key: 'on_track', label: 'On Track', color: '#2563eb' },
  at_risk: { key: 'at_risk', label: 'At Risk', color: '#f59e0b' },
  off_track: { key: 'off_track', label: 'Off Track', color: '#ef4444' },
  overdue: { key: 'overdue', label: 'Overdue', color: '#ef4444' },
  completed: { key: 'completed', label: 'Completed', color: '#22c55e' },
  abandoned: { key: 'abandoned', label: 'Abandoned', color: '#64748b' },
};

export const DEADLINE_RISK = {
  low: { key: 'low', label: 'Low', color: '#22c55e' },
  medium: { key: 'medium', label: 'Medium', color: '#f59e0b' },
  high: { key: 'high', label: 'High', color: '#f97316' },
  critical: { key: 'critical', label: 'Critical', color: '#ef4444' },
};

export const GOAL_COLORS = ['#2563eb', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
