import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estadisticasApi } from '../api/endpoints/estadisticas';
import { intentosApi } from '../api/endpoints/intentos';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import type { Intento } from '../types/domain';

export function useEstadisticasQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  
  return useQuery({
    queryKey: ['estadisticas'],
    queryFn: async () => {
      const stats = await estadisticasApi.getEstadisticas();
      return {
        data: stats,
        isOfflineMode: apiClient.getMode() === 'static'
      };
    },
    enabled: isAuthenticated,
  });
}

export function useHistorialQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  
  return useQuery({
    queryKey: ['historial'],
    queryFn: async () => {
      const historial = await intentosApi.getHistorial();
      return {
        data: historial,
        isOfflineMode: apiClient.getMode() === 'static'
      };
    },
    enabled: isAuthenticated,
  });
}

export function useSubmitIntento() {
  const queryClient = useQueryClient();
  const addLocalIntento = useAnalyticsStore((s) => s.addLocalIntento);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return useMutation({
    mutationFn: async (intento: Intento) => {
      const finalIntento: Intento = { ...intento, id: Date.now() };
      if (isAuthenticated) {
        const result = await intentosApi.saveIntento(intento);
        return result || finalIntento;
      }
      return finalIntento;
    },
    onSuccess: (savedIntento) => {
      addLocalIntento(savedIntento);
      queryClient.invalidateQueries({ queryKey: ['historial'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
    },
    onError: (error, variables) => {
      console.error("Failed to submit intento:", error);
      // Fallback
      addLocalIntento({ ...variables, id: Date.now() });
    }
  });
}
