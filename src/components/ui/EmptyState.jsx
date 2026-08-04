import { Icon } from './Icon';
import { COLORS } from '../../theme/colors';

export function EmptyState({ icon = 'checkmark-done-circle-outline', title, description, ctaLabel, onCtaPress }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-10 py-10 m-auto">
      <div className="mb-5 h-20 w-20 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900">
        <Icon name={icon} size={40} color={COLORS.primary} />
      </div>
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{title}</p>
      {description ? (
        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">{description}</p>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <button
          onClick={onCtaPress}
          type="button"
          aria-label={ctaLabel}
          className="mt-5 flex flex-row items-center rounded-full bg-primary-600 px-5 py-2.5"
        >
          <Icon name="add" size={16} color="#fff" />
          <span className="ml-1.5 text-sm font-semibold text-white">{ctaLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
