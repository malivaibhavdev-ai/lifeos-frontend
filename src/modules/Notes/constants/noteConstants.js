// Mirrors backend note.validation.js / Note.model.js enums — plain string
// maps, same convention as every other module's constants file.
export const NOTE_TYPES = {
  note: { key: 'note', label: 'Note', icon: 'document-text-outline' },
  meeting: { key: 'meeting', label: 'Meeting Note', icon: 'people-outline' },
  card: { key: 'card', label: 'Knowledge Card', icon: 'albums-outline' },
};
export const NOTE_TYPES_ORDER = ['note', 'meeting', 'card'];

export const MOOD = {
  terrible: { key: 'terrible', label: 'Terrible', emoji: '😢' },
  bad: { key: 'bad', label: 'Bad', emoji: '🙁' },
  okay: { key: 'okay', label: 'Okay', emoji: '😐' },
  good: { key: 'good', label: 'Good', emoji: '🙂' },
  great: { key: 'great', label: 'Great', emoji: '😄' },
};
export const MOOD_ORDER = ['terrible', 'bad', 'okay', 'good', 'great'];

export const NOTE_COLORS = ['#2563eb', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

// Toolbar buttons for the markdown editor — each inserts (or wraps
// selected text with) a snippet at the cursor.
export const MARKDOWN_TOOLBAR = [
  { key: 'bold', icon: 'text-outline', before: '**', after: '**', label: 'Bold' },
  { key: 'italic', icon: 'text', before: '_', after: '_', label: 'Italic' },
  { key: 'heading', icon: 'text-outline', before: '## ', after: '', label: 'Heading' },
  { key: 'checklist', icon: 'checkbox-outline', before: '- [ ] ', after: '', label: 'Checklist' },
  { key: 'bullet', icon: 'list-outline', before: '- ', after: '', label: 'Bulleted list' },
  { key: 'numbered', icon: 'reorder-four-outline', before: '1. ', after: '', label: 'Numbered list' },
  { key: 'quote', icon: 'return-down-forward-outline', before: '> ', after: '', label: 'Quote' },
  { key: 'code', icon: 'code-slash-outline', before: '```\n', after: '\n```', label: 'Code block' },
  { key: 'callout', icon: 'information-circle-outline', before: '> [!note] ', after: '', label: 'Callout' },
  { key: 'link', icon: 'link-outline', before: '[[', after: ']]', label: 'Internal link' },
];
