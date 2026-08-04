import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

function swap(arr, i, j) {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next.map((item, index) => ({ ...item, order: index }));
}

export function SubtaskList({ value = [], onChange }) {
  const [draft, setDraft] = useState('');

  const addSubtask = () => {
    const title = draft.trim();
    if (!title) return;
    onChange([...value, { title, isCompleted: false, order: value.length }]);
    setDraft('');
  };

  const toggleSubtask = (index) => {
    onChange(value.map((s, i) => (i === index ? { ...s, isCompleted: !s.isCompleted } : s)));
  };

  const removeSubtask = (index) => onChange(value.filter((_, i) => i !== index));

  const moveSubtask = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) return;
    onChange(swap(value, index, targetIndex));
  };

  const completedCount = value.filter((s) => s.isCompleted).length;

  return (
    <div>
      {value.length > 0 ? (
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          {completedCount}/{value.length} completed
        </p>
      ) : null}

      {value.map((subtask, index) => (
        <div key={subtask._id ?? index} className="mb-2 flex flex-row items-center">
          <button
            type="button"
            onClick={() => toggleSubtask(index)}
            role="checkbox"
            aria-checked={subtask.isCompleted}
            aria-label={subtask.isCompleted ? 'Mark subtask as not completed' : 'Mark subtask as completed'}
            className="mr-3 h-5 w-5 flex items-center justify-center rounded-full border-2 border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
            style={{ backgroundColor: subtask.isCompleted ? '#2563eb' : 'transparent' }}
          >
            {subtask.isCompleted ? <Icon name="checkmark" size={12} color="#fff" /> : null}
          </button>

          <span
            className={`flex-1 text-base ${
              subtask.isCompleted ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'
            }`}
          >
            {subtask.title}
          </span>

          <button
            type="button"
            onClick={() => moveSubtask(index, -1)}
            disabled={index === 0}
            aria-label="Move subtask up"
            className="px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            <Icon name="chevron-up" size={16} color={index === 0 ? '#e5e7eb' : '#94a3b8'} />
          </button>
          <button
            type="button"
            onClick={() => moveSubtask(index, 1)}
            disabled={index === value.length - 1}
            aria-label="Move subtask down"
            className="px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            <Icon name="chevron-down" size={16} color={index === value.length - 1 ? '#e5e7eb' : '#94a3b8'} />
          </button>
          <button
            type="button"
            onClick={() => removeSubtask(index)}
            aria-label="Remove subtask"
            className="pl-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            <Icon name="close" size={16} color="#cbd5e1" />
          </button>
        </div>
      ))}

      <div className="mt-1 flex flex-row items-center">
        <Icon name="add-circle-outline" size={20} color="#94a3b8" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSubtask();
            }
          }}
          placeholder="Add a subtask"
          aria-label="Add a subtask"
          className="ml-2 flex-1 py-2 text-base text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
