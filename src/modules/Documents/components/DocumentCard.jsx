import { Icon } from '../../../components/ui/Icon';
import { formatBytes } from '../utils/formatBytes';

const CATEGORY_ICON = {
  certificate: 'ribbon-outline',
  medical_report: 'medkit-outline',
  government_id: 'card-outline',
  passport: 'airplane-outline',
  driving_licence: 'car-outline',
  insurance: 'shield-checkmark-outline',
  education: 'school-outline',
  career: 'briefcase-outline',
  finance: 'cash-outline',
  legal: 'hammer-outline',
  travel: 'earth-outline',
  property: 'home-outline',
  business: 'business-outline',
  receipt: 'receipt-outline',
  invoice: 'document-text-outline',
  contract: 'create-outline',
  research: 'flask-outline',
  knowledge: 'bulb-outline',
  scanned: 'scan-outline',
  archive: 'archive-outline',
  personal: 'person-outline',
  other: 'document-outline',
};

export function DocumentCard({ document, onPress, selected, onLongPress }) {
  const icon = CATEGORY_ICON[document.category] ?? 'document-outline';
  return (
    <button
      type="button"
      onClick={() => onPress(document)}
      onContextMenu={onLongPress ? (e) => { e.preventDefault(); onLongPress(document); } : undefined}
      className={`mb-3 flex w-full flex-row items-center rounded-2xl border p-4 text-left ${selected ? 'border-primary-600 bg-primary-50 dark:bg-primary-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
        <Icon name={icon} size={22} color="#2563eb" />
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{document.title}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {formatBytes(document.sizeBytes)} · {document.category.replace(/_/g, ' ')}
        </p>
      </div>
      <div className="flex flex-row items-center" style={{ gap: 6 }}>
        {document.isLocked ? <Icon name="lock-closed" size={14} color="#94a3b8" /> : null}
        {document.isPinned ? <Icon name="pin" size={14} color="#f59e0b" /> : null}
        {document.isFavorite ? <Icon name="heart" size={14} color="#ef4444" /> : null}
        {document.ocr?.status === 'completed' ? <Icon name="text-outline" size={14} color="#22c55e" /> : null}
      </div>
    </button>
  );
}
