import { Icon } from './Icon';
import { Screen } from './Screen';
import { COLORS } from '../../theme/colors';

export function PlaceholderScreen({ icon, title, description }) {
  return (
    <Screen>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 m-auto text-center">
        <div className="mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900">
          <Icon name={icon} size={28} color={COLORS.primary} />
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="mt-2 max-w-sm text-center text-base text-gray-500 dark:text-gray-400">{description}</p>
        <div className="mt-6 rounded-full bg-gray-100 px-4 py-1.5 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Coming soon</p>
        </div>
      </div>
    </Screen>
  );
}
