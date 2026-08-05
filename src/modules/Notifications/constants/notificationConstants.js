// Mirrors the backend's TYPES/PRIORITY_LEVELS enums exactly (see
// Notification.model.js / priorityEngine.util.js) and the mobile app's own
// copy of this file — icon names are keys into the web Icon.jsx allowlist
// (react-icons/io5), not identical strings to Ionicons in every case
// (e.g. 'analytics' uses 'stats-chart-outline' here since that's the name
// already available in the shared web icon set).
export const TYPE_ICON = {
  medicine: 'medkit-outline',
  water: 'water-outline',
  workout: 'barbell-outline',
  sleep: 'moon-outline',
  task: 'checkbox-outline',
  birthday: 'gift-outline',
  bill: 'receipt-outline',
  goal: 'flag-outline',
  general: 'notifications-outline',
  household: 'people-outline',
  document: 'document-text-outline',
  analytics: 'stats-chart-outline',
  reminder: 'alarm-outline',
  information: 'information-circle-outline',
  warning: 'warning-outline',
  critical: 'alert-circle-outline',
  emergency: 'megaphone-outline',
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
  achievement: 'trophy-outline',
  habit: 'repeat-outline',
  finance: 'cash-outline',
  health: 'heart-outline',
  career: 'briefcase-outline',
  family: 'home-outline',
  travel: 'airplane-outline',
  project: 'folder-outline',
  system: 'settings-outline',
  custom: 'sparkles-outline',
  digest: 'newspaper-outline',
};

export const PRIORITY_COLOR = {
  critical: '#ef4444',
  high: '#f59e0b',
  normal: '#2563eb',
  low: '#94a3b8',
  silent: '#cbd5e1',
};

export const PRIORITY_LABEL = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
  silent: 'Silent',
};

export const PRIORITY_LEVELS = ['critical', 'high', 'normal', 'low', 'silent'];

export const CHANNEL_LABEL = {
  in_app: 'In-App',
  push: 'Mobile Push',
  web_push: 'Web Push',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  slack: 'Slack',
  teams: 'Teams',
  webhook: 'Webhook',
};

export const SNOOZE_PRESETS = [
  { key: '5m', label: '5 minutes' },
  { key: '10m', label: '10 minutes' },
  { key: '30m', label: '30 minutes' },
  { key: '1h', label: '1 hour' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'This weekend' },
];

export const DIGEST_PERIODS = [
  { key: 'morning', label: 'Morning Brief' },
  { key: 'evening', label: 'Evening Summary' },
  { key: 'daily', label: 'Daily Digest' },
  { key: 'weekly', label: 'Weekly Report' },
  { key: 'monthly', label: 'Monthly Summary' },
];

export const NOTIFICATION_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'archived', label: 'Archived' },
];
