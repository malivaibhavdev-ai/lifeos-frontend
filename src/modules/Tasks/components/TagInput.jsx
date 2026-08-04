import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

export function TagInput({ value = [], onChange }) {
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    const cleaned = draft.trim().toLowerCase().replace(/^#/, '');
    if (cleaned && !value.includes(cleaned)) {
      onChange([...value, cleaned]);
    }
    setDraft('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      <div className="flex flex-row flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <div key={tag} className="flex flex-row items-center rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900">
            <span className="mr-1 text-sm text-primary-700 dark:text-primary-200">#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
            >
              <Icon name="close" size={14} color="#2563eb" />
            </button>
          </div>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitDraft();
          }
        }}
        onBlur={commitDraft}
        placeholder="Add a tag and press enter"
        aria-label="Add a tag"
        autoCapitalize="none"
        className="h-11 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:text-white bg-transparent outline-none focus:border-primary-600"
      />
    </div>
  );
}
