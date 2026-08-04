import { Icon } from '../../../components/ui/Icon';

const COLOR_HEX = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308', lime: '#84cc16',
  green: '#22c55e', teal: '#14b8a6', cyan: '#06b6d4', blue: '#3b82f6', indigo: '#6366f1',
  violet: '#8b5cf6', pink: '#ec4899', gray: '#6b7280',
};

export function FolderCard({ folder, onPress, onLongPress }) {
  const color = COLOR_HEX[folder.color] ?? '#2563eb';
  return (
    <button
      type="button"
      onClick={() => onPress(folder)}
      onContextMenu={onLongPress ? (e) => { e.preventDefault(); onLongPress(folder); } : undefined}
      className="mb-3 flex w-full flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
        {folder.emoji ? (
          <span className="text-xl">{folder.emoji}</span>
        ) : (
          <Icon name={folder.icon || 'folder-outline'} size={22} color={color} />
        )}
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <p className="text-base font-semibold text-gray-900 dark:text-white">{folder.name}</p>
        {folder.description ? (
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{folder.description}</p>
        ) : null}
      </div>
      <div className="flex flex-row items-center" style={{ gap: 6 }}>
        {folder.isLocked ? <Icon name="lock-closed" size={14} color="#94a3b8" /> : null}
        {folder.isPinned ? <Icon name="pin" size={14} color="#f59e0b" /> : null}
        {folder.isFavorite ? <Icon name="heart" size={14} color="#ef4444" /> : null}
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </div>
    </button>
  );
}
