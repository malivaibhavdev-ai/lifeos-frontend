import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { SORT_OPTIONS } from '../constants/taskConstants';
import { useTaskUiStore } from '../store/taskUiStore';

export function SortMenu({ visible, onClose }) {
  const sortKey = useTaskUiStore((s) => s.sortKey);
  const sortDir = useTaskUiStore((s) => s.sortDir);
  const setSort = useTaskUiStore((s) => s.setSort);

  return (
    <Modal visible={visible} onClose={onClose} title="Sort by">
      {SORT_OPTIONS.map((option) => {
        const isActive = sortKey === option.key;
        return (
          <button
            type="button"
            key={option.key}
            onClick={() => setSort(option.key, isActive ? (sortDir === 'asc' ? 'desc' : 'asc') : null)}
            aria-pressed={isActive}
            className="flex w-full flex-row items-center justify-between border-b border-gray-100 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-gray-800"
          >
            <span className={`text-base ${isActive ? 'font-semibold text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {option.label}
            </span>
            {isActive ? (
              <span className="flex flex-row items-center">
                <Icon name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#2563eb" />
                <Icon name="checkmark" size={18} color="#2563eb" style={{ marginLeft: 8 }} />
              </span>
            ) : null}
          </button>
        );
      })}
    </Modal>
  );
}
