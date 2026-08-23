import { apiClient } from '../client';
import type { Estadisticas } from '../../types/domain';

export const estadisticasApi = {
  getEstadisticas: (): Promise<Estadisticas> => {
    return apiClient.get<Estadisticas>('/analytics', 'analytics_mock.json');
  }
};
