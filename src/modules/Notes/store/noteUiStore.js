import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));
const MAX_RECENT_SEARCHES = 10;

// Client/UI-only state, same boundary as habitUiStore/goalUiStore — note/
// notebook/journal *data* always lives in TanStack Query's cache. Recent
// searches live here (not on the backend) since they're ephemeral,
// device-local convenience, not something the user explicitly saved.
export const useNoteUiStore = create(
  persist(
    (set) => ({
      workspaceTab: 'notes', // 'notes' | 'notebooks'
      setWorkspaceTab: (workspaceTab) => set({ workspaceTab }),
      notebookFilter: null,
      setNotebookFilter: (notebookFilter) => set({ notebookFilter }),
      recentSearches: [],
      addRecentSearch: (term) =>
        set((state) => {
          const trimmed = term.trim();
          if (!trimmed) return state;
          const next = [trimmed, ...state.recentSearches.filter((t) => t !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
          return { recentSearches: next };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'note-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({
        workspaceTab: state.workspaceTab,
        notebookFilter: state.notebookFilter,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
