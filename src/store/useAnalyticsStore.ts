import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Intento } from '../types/domain';

interface AnalyticsState {
  // Local history for guests or offline fallback
  historial: Intento[];
  
  // Actions
  addLocalIntento: (intento: Intento) => void;
  resetAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      historial: [],

      addLocalIntento: (intento) => set((state) => ({
        historial: [...state.historial, intento]
      })),

      resetAnalytics: () => set({ historial: [] })
    }),
    {
      name: 'nain_tai_analytics_v1',
      partialize: (state) => ({ historial: state.historial })
    }
  )
);
