import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '../../../utils/secureStorage';

const secureJSONStorage = createJSONStorage(() => ({ getItem, setItem, removeItem }));

// Client/UI-only state for the Calendar workspace — which view is active and
// which date is currently in frame, shared across Day/Week/Month so
// switching views doesn't lose your place. Only viewMode is persisted
// (matches Tasks' taskUiStore precedent) — visibleDate resets to today on a
// fresh launch, which is the expected behavior for a calendar.
export const useCalendarUiStore = create(
  persist(
    (set) => ({
      viewMode: 'day', // 'day' | 'week' | 'month'
      visibleDate: new Date().toISOString(),

      setViewMode: (viewMode) => set({ viewMode }),
      setVisibleDate: (visibleDate) => set({ visibleDate }),
      goToToday: () => set({ visibleDate: new Date().toISOString() }),
    }),
    {
      name: 'calendar-ui-store',
      storage: secureJSONStorage,
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);
