import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { intentosApi } from '../api/endpoints/intentos';
import { useAuthStore } from './useAuthStore';
import { estadisticasApi } from '../api/endpoints/estadisticas';
import type { Intento, Estadisticas } from '../types/domain';
import { apiClient } from '../api/client';

interface AnalyticsState {
  // Sync state
  isOfflineMode: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  estadisticas: Estadisticas | null;
  historial: Intento[];

  // Actions
  fetchEstadisticas: () => Promise<void>;
  fetchHistorial: () => Promise<void>;
  submitIntento: (intento: Intento) => Promise<void>;
  resetAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      isOfflineMode: false,
      isLoading: false,
      error: null,
      estadisticas: null,
      historial: [],

      fetchEstadisticas: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await estadisticasApi.getEstadisticas();
          const offline = apiClient.getMode() === 'static';
          set({ estadisticas: stats, isLoading: false, isOfflineMode: offline });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Error al cargar estadísticas' });
        }
      },

      fetchHistorial: async () => {
        set({ isLoading: true, error: null });
        try {
          const historial = await intentosApi.getHistorial();
          const offline = apiClient.getMode() === 'static';
          set({ historial, isLoading: false, isOfflineMode: offline });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Error al cargar historial' });
        }
      },

      submitIntento: async (intento) => {
        const { token } = useAuthStore.getState();
        try {
          let finalIntento: Intento = { ...intento, id: Date.now() };
          
          if (token) {
            const result = await intentosApi.saveIntento(intento);
            if (result) finalIntento = result;
          }
          
          set((state) => ({
            historial: [...state.historial, finalIntento]
          }));
        } catch (error: any) {
          console.error("Failed to submit intento:", error);
          // Fallback to local
          set((state) => ({
            historial: [...state.historial, { ...intento, id: Date.now() }]
          }));
        }
      },

      resetAnalytics: () => set({ estadisticas: null, historial: [] })
    }),
    {
      name: 'nain_tai_analytics_v1',
      // Only persist local history (historial) just in case offline mode is triggered.
      partialize: (state) => ({ historial: state.historial })
    }
  )
);
