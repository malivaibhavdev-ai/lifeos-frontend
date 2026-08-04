import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

// Generic freeform multi-tag input — reused across symbols/people/places/
// animals/objects/colors/sounds/smells/tastes/sensations/categories/tags on
// the dream entry form, instead of a bespoke input per field.
export function TagChipInput({ label, value = [], onChange, placeholder = 'Add and press enter' }) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="mb-4">
      {label ? <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p> : null}
      {value.length > 0 ? (
        <div className="mb-2 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {value.map((tag) => (
            <div
              key={tag}
              className="flex flex-row items-center rounded-full border border-primary-600 bg-primary-50 px-3 py-1.5 dark:bg-primary-950"
            >
              <span className="mr-1 text-xs font-medium text-primary-600">{tag}</span>
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                <Icon name="close-circle" size={14} color="#2563eb" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </div>
  );
}
