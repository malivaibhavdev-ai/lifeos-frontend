import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Client/UI-only state for the Tasks module — active smart list, sort,
// search, filters, multi-select, and the active workspace view. Server data
// itself lives entirely in TanStack Query; this store never holds task
// documents. Only `viewMode` is persisted (see partialize below) — it's the
// one preference worth remembering across app launches; search/filters/
// selection are session-scoped and should reset on a fresh start.
export const useTaskUiStore = create(
  persist(
    (set, get) => ({
      // Inbox, not Today — most quick-added tasks have no due date yet, and
      // Today's filter explicitly excludes undated tasks. Defaulting here
      // means a freshly created task is always visible without the user
      // hunting for it.
      activeList: 'inbox',
      sortKey: 'order',
      sortDir: null, // null = use the sort's own default direction
      searchQuery: '',
      filters: { priority: null, tags: [], category: null, energyLevel: null },
      selectedIds: [],
      isSelectionMode: false,

      // See navigation/viewRegistry.js for the full set of valid keys.
      viewMode: 'list',

      setActiveList: (key) => set({ activeList: key }),
      setSort: (sortKey, sortDir = null) => set({ sortKey, sortDir }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      resetFilters: () => set({ filters: { priority: null, tags: [], category: null, energyLevel: null } }),
      setViewMode: (viewMode) => set({ viewMode }),

      toggleSelected: (id) => {
        const { selectedIds } = get();
        const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
        set({ selectedIds: next, isSelectionMode: next.length > 0 });
      },
      clearSelection: () => set({ selectedIds: [], isSelectionMode: false }),
      enterSelectionMode: (id) => set({ selectedIds: [id], isSelectionMode: true }),
    }),
    {
      name: 'task-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);
