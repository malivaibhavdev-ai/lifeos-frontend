import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { SNOOZE_PRESETS } from '../constants/notificationConstants';

export function SnoozeModal({ visible, onClose, onSelect }) {
  return (
    <Modal visible={visible} onClose={onClose} title="Snooze">
      {SNOOZE_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onSelect(preset.key)}
          className="flex w-full flex-row items-center justify-between border-b border-gray-100 py-3.5 text-left dark:border-gray-800"
        >
          <span className="text-[15px] text-gray-900 dark:text-white">{preset.label}</span>
          <Icon name="chevron-forward" size={18} color="#94a3b8" />
        </button>
      ))}
    </Modal>
  );
}
