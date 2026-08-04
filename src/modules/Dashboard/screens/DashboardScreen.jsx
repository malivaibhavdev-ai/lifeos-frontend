import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { useAuthStore } from '../../../Store/authStore';
import { FinanceDashboardWidget } from '../components/FinanceDashboardWidget';
import { CareerDashboardWidget } from '../components/CareerDashboardWidget';
import { HealthDashboardWidget } from '../components/HealthDashboardWidget';
import { NotesDashboardWidget } from '../components/NotesDashboardWidget';
import { GoalsDashboardWidget } from '../components/GoalsDashboardWidget';
import { HabitsDashboardWidget } from '../components/HabitsDashboardWidget';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-7xl">
        <div className="flex flex-row items-center justify-between pb-4 pt-2">
          <div className="flex-1 flex flex-row items-center">
            <div className="mr-3 h-11 w-11 flex items-center justify-center rounded-full bg-primary-600">
              <span className="text-sm font-bold text-white">{initials(user?.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xl font-bold text-gray-900 dark:text-white">
                {greeting()}
                {user?.name ? `, ${user.name}` : ''}
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Be your best self, every day.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="ml-2 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <Icon name="notifications-outline" size={20} color="#94a3b8" />
          </button>
        </div>

        {/* Single column on phone widths (matches mobile exactly); widens to
            2 then 3 columns as viewport grows, so widgets use the available
            desktop width instead of stretching into one narrow strip. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <FinanceDashboardWidget />
          <CareerDashboardWidget />
          <HealthDashboardWidget />
          <NotesDashboardWidget />
          <GoalsDashboardWidget />
          <HabitsDashboardWidget />
        </div>
      </PageContainer>
    </Screen>
  );
}
