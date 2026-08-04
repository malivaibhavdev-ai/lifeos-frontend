import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Client/UI-only state — every Health record itself lives in TanStack
// Query's cache, same boundary as every other module's UI store.
export const useHealthUiStore = create(
  persist(
    (set) => ({
      lastBottlePresetMl: 250,
      setLastBottlePresetMl: (lastBottlePresetMl) => set({ lastBottlePresetMl }),
    }),
    {
      name: 'health-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ lastBottlePresetMl: state.lastBottlePresetMl }),
    }
  )
);
