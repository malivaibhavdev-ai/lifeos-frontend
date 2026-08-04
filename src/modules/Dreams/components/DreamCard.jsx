import { Icon } from '../../../components/ui/Icon';
import dayjs from 'dayjs';

export function DreamCard({ dream, onPress }) {
  return (
    <button
      type="button"
      onClick={() => onPress(dream)}
      className="mb-3 w-full rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex flex-row items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {dayjs(dream.date).format('ddd, MMM D')}
        </span>
        <div className="flex flex-row items-center" style={{ gap: 6 }}>
          {dream.isFavorite ? <Icon name="star" size={14} color="#f59e0b" /> : null}
          {dream.isLucid ? <Icon name="flash" size={14} color="#22c55e" /> : null}
          {dream.isNightmare ? <Icon name="thunderstorm" size={14} color="#f87171" /> : null}
          {dream.isLocked ? <Icon name="lock-closed" size={14} color="#94a3b8" /> : null}
        </div>
      </div>

      <p className="mt-1.5 truncate text-base font-bold text-gray-900 dark:text-white">{dream.title || 'Untitled dream'}</p>

      {dream.isLocked ? (
        <p className="mt-1 text-sm italic text-gray-400 dark:text-gray-500">Locked — click to unlock</p>
      ) : dream.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{dream.description}</p>
      ) : null}

      {(dream.categories?.length ?? 0) > 0 ? (
        <div className="mt-2.5 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {dream.categories.slice(0, 4).map((category) => (
            <div key={category} className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
              <span className="text-[11px] font-medium capitalize text-gray-600 dark:text-gray-300">{category}</span>
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
}
