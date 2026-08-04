import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Client/UI-only state, same boundary as habitUiStore — the actual Life
// Area / Vision / Goal / Project / Milestone data always lives in TanStack
// Query's cache, never duplicated here.
export const useGoalUiStore = create(
  persist(
    (set) => ({
      workspaceTab: 'goals', // 'goals' | 'projects' | 'roadmap'
      setWorkspaceTab: (workspaceTab) => set({ workspaceTab }),
      lifeAreaFilter: null, // selected life area id, or null for "all"
      setLifeAreaFilter: (lifeAreaFilter) => set({ lifeAreaFilter }),
    }),
    {
      name: 'goal-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ workspaceTab: state.workspaceTab, lifeAreaFilter: state.lifeAreaFilter }),
    }
  )
);
