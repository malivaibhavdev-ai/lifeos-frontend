import { useRef } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { MARKDOWN_TOOLBAR } from '../constants/noteConstants';

// A plain-textarea markdown "source" editor with a snippet toolbar — mirrors
// the RN version's plain-TextInput approach (no rich-text editor package).
// MarkdownPreview (sibling file) is the read/rendered view; toggling
// between the two IS the editor.
export function MarkdownEditor({ value, onChangeText, placeholder = 'Start writing…', autoFocus = false }) {
  const inputRef = useRef(null);

  const insertSnippet = (before, after) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? 0;
    const end = el?.selectionEnd ?? 0;
    const text = value ?? '';
    const selected = text.slice(start, end);
    const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`;
    onChangeText(next);

    const cursor = start + before.length + selected.length + (selected ? after.length : 0);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        aria-label="Note content"
        autoFocus={autoFocus}
        className="flex-1 resize-none px-4 py-3 text-base leading-6 text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
      />
      <div className="flex flex-row overflow-x-auto border-t border-gray-100 px-2 py-2 dark:border-gray-800" style={{ flexGrow: 0 }}>
        {MARKDOWN_TOOLBAR.map((btn) => (
          <button
            type="button"
            key={btn.key}
            onClick={() => insertSnippet(btn.before, btn.after)}
            aria-label={btn.label}
            className="mx-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <Icon name={btn.icon} size={17} color="#2563eb" />
          </button>
        ))}
      </div>
    </div>
  );
}
