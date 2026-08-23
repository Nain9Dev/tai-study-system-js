import { apiClient } from '../client';
import type { Estadisticas } from '../../types/domain';

export const estadisticasApi = {
  getEstadisticas: (): Promise<Estadisticas> => {
    return apiClient.get<Estadisticas>('/progreso/estadisticas', 'estadisticas_mock.json');
  }
};
