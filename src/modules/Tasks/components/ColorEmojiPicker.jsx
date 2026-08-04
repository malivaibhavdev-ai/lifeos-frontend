import { Icon } from '../../../components/ui/Icon';
import { TASK_COLORS } from '../constants/taskConstants';

export function ColorEmojiPicker({ color, emoji, onChangeColor, onChangeEmoji }) {
  return (
    <div className="flex flex-row items-center">
      <input
        value={emoji ?? ''}
        onChange={(e) => onChangeEmoji(e.target.value.slice(0, 2) || null)}
        placeholder="🙂"
        aria-label="Emoji"
        className="mr-3 h-11 w-11 rounded-xl border border-gray-300 text-center text-lg dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      />
      <div className="flex-1 flex flex-row items-center">
        {TASK_COLORS.map((swatch) => (
          <button
            type="button"
            key={swatch}
            onClick={() => onChangeColor(color === swatch ? null : swatch)}
            aria-label={`Color ${swatch}`}
            aria-pressed={color === swatch}
            className="mr-2 h-8 w-8 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            style={{ backgroundColor: swatch }}
          >
            {color === swatch ? <Icon name="checkmark" size={16} color="#fff" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
