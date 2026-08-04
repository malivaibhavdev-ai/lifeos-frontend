import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Client/UI-only state for the Dreams workspace — which tab is active.
// Session-scoped filters are intentionally NOT persisted, same convention
// as Habits' habitUiStore.
export const useDreamUiStore = create(
  persist(
    (set) => ({
      activeTab: 'dashboard', // 'dashboard' | 'all'
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'dream-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
