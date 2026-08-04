import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Which household the Family module is currently showing — the one piece
// of client state every Family screen needs, since a user can belong to
// more than one household (in-laws, extended family, etc.) but only views
// one at a time. Persisted so returning to the app resumes on the same
// household instead of forcing a re-pick every launch.
export const useActiveHouseholdStore = create(
  persist(
    (set) => ({
      activeHouseholdId: null,
      setActiveHouseholdId: (activeHouseholdId) => set({ activeHouseholdId }),
    }),
    {
      name: 'active-household-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ activeHouseholdId: state.activeHouseholdId }),
    }
  )
);
