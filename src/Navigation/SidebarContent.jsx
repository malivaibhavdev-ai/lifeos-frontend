import { NavLink } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { useAuthStore } from '../Store/authStore';
import { MODULES, MODULE_ROUTES, MORE_MENU_ORDER } from '../constants/modules';
import { COLORS } from '../theme/colors';
import { useNotificationStore } from '../modules/Notifications/store/notificationStore';

// Cycled per row so the module list reads as a set of distinct destinations
// rather than one flat blue list — same alpha-chip technique as the Dashboard
// widgets (`${color}20` background behind a solid-color icon).
const ROW_COLORS = ['#2563eb', '#14b8a6', '#8b5cf6', '#f97316', '#ec4899', '#0ea5e9', '#22c55e'];

const PRIMARY_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'home-outline' },
  { to: '/tasks', label: 'Tasks', icon: 'checkbox-outline' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar-outline' },
  { to: '/finance', label: 'Finance', icon: 'wallet-outline' },
];

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function NavRow({ to, label, icon, color, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-row items-center rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
        }`
      }
    >
      <div className="mr-3 h-9 w-9 flex items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
        <Icon name={icon} size={18} color={color} />
      </div>
      <span className="flex-1 text-base font-medium text-gray-900 dark:text-white">{label}</span>
      {badge > 0 ? (
        <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <div className="flex h-full flex-1 flex-col bg-white dark:bg-gray-900" onClick={onNavigate}>
      <div className="flex flex-row items-center border-b border-gray-100 px-5 py-5 dark:border-gray-800">
        <div className="mr-3 h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
          <span className="text-base font-bold text-white">{initials(user?.name)}</span>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-white">{user?.name ?? 'SelfOS'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Be your best self, every day.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-2 flex flex-col gap-0.5">
          {PRIMARY_ITEMS.map((item, index) => (
            <NavRow key={item.to} {...item} color={ROW_COLORS[index % ROW_COLORS.length]} />
          ))}
        </div>
        <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
        <div className="flex flex-col gap-0.5">
          {MORE_MENU_ORDER.map((key, index) => (
            <NavRow
              key={key}
              to={MODULE_ROUTES[key]}
              label={MODULES[key].title}
              icon={MODULES[key].icon}
              color={ROW_COLORS[(index + PRIMARY_ITEMS.length) % ROW_COLORS.length]}
              badge={key === 'notifications' ? unreadCount : 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { PRIMARY_ITEMS };
export const MUTED_DARK = COLORS.mutedDark;
