import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Client/UI-only state for the Habits workspace — which tab is active.
// Selection/filter state is intentionally NOT persisted (session-scoped,
// matches Tasks' taskUiStore precedent).
export const useHabitUiStore = create(
  persist(
    (set) => ({
      activeTab: 'today', // 'today' | 'all' | 'routines'
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'habit-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
