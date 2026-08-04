import { PlaceholderScreen } from '../../../components/ui/PlaceholderScreen';
import { MODULES } from '../../../constants/modules';

export function NotificationsScreen() {
  const { icon, title, description } = MODULES.notifications;
  return <PlaceholderScreen icon={icon} title={title} description={description} />;
}
