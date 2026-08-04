import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { VIEW_REGISTRY } from '../navigation/viewRegistry';

export function ViewSwitcherSheet({ visible, activeKey, onSelect, onClose }) {
  return (
    <Modal visible={visible} onClose={onClose} title="View">
      {VIEW_REGISTRY.map((view) => {
        const isSelected = view.key === activeKey;
        return (
          <button
            type="button"
            key={view.key}
            onClick={() => {
              onSelect(view.key);
              onClose();
            }}
            aria-current={isSelected ? 'true' : undefined}
            className="flex w-full flex-row items-center justify-between border-b border-gray-100 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-gray-800"
          >
            <span className="flex flex-row items-center">
              <Icon name={view.icon} size={19} color={isSelected ? '#2563eb' : '#64748b'} />
              <span className={`ml-3 text-base ${isSelected ? 'font-semibold text-primary-600' : 'text-gray-900 dark:text-white'}`}>
                {view.label}
              </span>
            </span>
            {isSelected ? <Icon name="checkmark" size={18} color="#2563eb" /> : null}
          </button>
        );
      })}
    </Modal>
  );
}
