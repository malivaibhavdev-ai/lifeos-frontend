import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ENERGY_LEVEL, PRIORITY, PRIORITY_ORDER } from '../constants/taskConstants';
import { useTaskMeta } from '../hooks/useTasks';
import { useTaskUiStore } from '../store/taskUiStore';

function Chip({ label, isSelected, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={isSelected}
      className={`mb-2 mr-2 rounded-full border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
        isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
    </button>
  );
}

export function FilterSheet({ visible, onClose }) {
  const { data: meta } = useTaskMeta();
  const filters = useTaskUiStore((s) => s.filters);
  const setFilters = useTaskUiStore((s) => s.setFilters);
  const resetFilters = useTaskUiStore((s) => s.resetFilters);

  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    setFilters({ tags: next });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Filters">
      <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Priority</p>
      <div className="flex flex-row flex-wrap">
        {PRIORITY_ORDER.map((key) => (
          <Chip
            key={key}
            label={PRIORITY[key].label}
            isSelected={filters.priority === key}
            onPress={() => setFilters({ priority: filters.priority === key ? null : key })}
          />
        ))}
      </div>

      <p className="mb-2 mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Energy level</p>
      <div className="flex flex-row flex-wrap">
        {Object.values(ENERGY_LEVEL).map((level) => (
          <Chip
            key={level.key}
            label={level.label}
            isSelected={filters.energyLevel === level.key}
            onPress={() => setFilters({ energyLevel: filters.energyLevel === level.key ? null : level.key })}
          />
        ))}
      </div>

      {meta?.categories?.length > 0 ? (
        <>
          <p className="mb-2 mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Category</p>
          <div className="flex flex-row flex-wrap">
            {meta.categories.map((category) => (
              <Chip
                key={category}
                label={category}
                isSelected={filters.category === category}
                onPress={() => setFilters({ category: filters.category === category ? null : category })}
              />
            ))}
          </div>
        </>
      ) : null}

      {meta?.tags?.length > 0 ? (
        <>
          <p className="mb-2 mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Tags</p>
          <div className="flex flex-row flex-wrap">
            {meta.tags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} isSelected={filters.tags.includes(tag)} onPress={() => toggleTag(tag)} />
            ))}
          </div>
        </>
      ) : null}

      <div className="mt-6">
        <Button title="Clear all filters" variant="secondary" onPress={resetFilters} />
      </div>
    </Modal>
  );
}
