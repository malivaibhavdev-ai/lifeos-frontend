import { ToggleButton } from './ToggleButton';
import { CHANNEL_LABEL } from '../constants/notificationConstants';

const CHANNEL_KEYS = ['in_app', 'push', 'web_push', 'email', 'sms', 'whatsapp', 'telegram', 'slack', 'teams', 'webhook'];

// email/sms/whatsapp/telegram/slack/teams currently resolve through stub
// delivery channels on the backend (see deliveryChannels.js's isReal
// flag) — still toggleable (the preference is honored the moment a real
// integration lands) but visually marked "Coming soon".
const REAL_CHANNELS = new Set(['in_app', 'push', 'web_push', 'webhook']);

export function ChannelToggleList({ channels, onChange }) {
  return (
    <div>
      {CHANNEL_KEYS.map((key) => (
        <div key={key} className="flex flex-row items-center justify-between py-2.5">
          <div>
            <p className="text-[15px] text-gray-900 dark:text-white">{CHANNEL_LABEL[key]}</p>
            {!REAL_CHANNELS.has(key) ? <p className="text-xs text-gray-400 dark:text-gray-500">Coming soon</p> : null}
          </div>
          <ToggleButton label="" value={channels?.[key] ?? false} onChange={(value) => onChange(key, value)} />
        </div>
      ))}
    </div>
  );
}
