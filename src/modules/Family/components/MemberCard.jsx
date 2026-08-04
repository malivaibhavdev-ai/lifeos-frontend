import { Icon } from '../../../components/ui/Icon';

const MEMBER_TYPE_ICON = {
  adult: 'person-outline',
  child: 'happy-outline',
  elder: 'walk-outline',
  pet: 'paw-outline',
  guardian: 'shield-outline',
  other: 'person-outline',
};

export function MemberCard({ member, onPress }) {
  return (
    <button
      type="button"
      onClick={() => onPress(member)}
      className="mb-3 flex w-full flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
        <Icon name={MEMBER_TYPE_ICON[member.memberType] ?? 'person-outline'} size={22} color="#2563eb" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-base font-semibold text-gray-900 dark:text-white">{member.name}</p>
        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{member.relationship || member.memberType}</p>
      </div>
      {member.isEmergencyContact ? <Icon name="alert-circle-outline" size={18} color="#f59e0b" /> : null}
      <Icon name="chevron-forward" size={18} color="#94a3b8" style={{ marginLeft: 8 }} />
    </button>
  );
}
