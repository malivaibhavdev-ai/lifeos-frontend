import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

const COMMON_EMOTIONS = [
  'fear', 'joy', 'peace', 'excitement', 'love', 'anger', 'stress', 'sadness',
  'anxiety', 'hope', 'confusion', 'surprise', 'embarrassment', 'curiosity', 'wonder',
];

// `value`: [{ name, intensity }]. Clicking a suggestion (or typing a custom
// one) adds it at intensity 3; the star row on each chip adjusts 1-5.
export function EmotionPicker({ value = [], onChange }) {
  const [draft, setDraft] = useState('');
  const selectedNames = new Set(value.map((e) => e.name));

  const addEmotion = (name) => {
    const trimmed = name.trim();
    if (!trimmed || selectedNames.has(trimmed)) return;
    onChange([...value, { name: trimmed, intensity: 3 }]);
    setDraft('');
  };

  const removeEmotion = (name) => onChange(value.filter((e) => e.name !== name));

  const setIntensity = (name, intensity) => onChange(value.map((e) => (e.name === name ? { ...e, intensity } : e)));

  return (
    <div className="mb-4">
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Emotions</p>

      {value.length > 0 ? (
        <div className="mb-3">
          {value.map((emotion) => (
            <div
              key={emotion.name}
              className="mb-2 flex flex-row items-center justify-between rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <span className="flex-1 text-sm font-medium capitalize text-gray-900 dark:text-white">{emotion.name}</span>
              <div className="flex flex-row items-center" style={{ gap: 4 }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button key={level} type="button" onClick={() => setIntensity(emotion.name, level)} aria-label={`Set ${emotion.name} intensity to ${level}`}>
                    <Icon name={level <= emotion.intensity ? 'star' : 'star-outline'} size={14} color={level <= emotion.intensity ? '#f59e0b' : '#cbd5e1'} />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => removeEmotion(emotion.name)} aria-label={`Remove ${emotion.name}`} className="ml-3">
                <Icon name="close-circle" size={16} color="#94a3b8" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-2 flex flex-row flex-wrap" style={{ gap: 6 }}>
        {COMMON_EMOTIONS.filter((name) => !selectedNames.has(name)).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => addEmotion(name)}
            className="rounded-full border border-gray-200 px-3 py-1.5 dark:border-gray-700"
          >
            <span className="text-xs font-medium capitalize text-gray-600 dark:text-gray-300">{name}</span>
          </button>
        ))}
      </div>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addEmotion(draft);
          }
        }}
        placeholder="Custom emotion..."
        className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </div>
  );
}
