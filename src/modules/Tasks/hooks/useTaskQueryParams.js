import { useTaskUiStore } from '../store/taskUiStore';

// Shared query-params builder — every view derives its GET /tasks params
// from the same header-level filters/search/sort, but each can override
// `view`/`sort`/`limit` for its own layout (e.g. Board wants 'all' instead
// of whatever smart list is selected; Calendar wants a wide limit).
export function useTaskQueryParams(overrides = {}) {
  const activeList = useTaskUiStore((s) => s.activeList);
  const sortKey = useTaskUiStore((s) => s.sortKey);
  const sortDir = useTaskUiStore((s) => s.sortDir);
  const searchQuery = useTaskUiStore((s) => s.searchQuery);
  const filters = useTaskUiStore((s) => s.filters);

  return {
    view: activeList,
    sort: sortKey,
    sortDir: sortDir ?? undefined,
    search: searchQuery || undefined,
    priority: filters.priority ?? undefined,
    energyLevel: filters.energyLevel ?? undefined,
    category: filters.category ?? undefined,
    tags: filters.tags.length ? filters.tags.join(',') : undefined,
    limit: 100,
    ...overrides,
  };
}
