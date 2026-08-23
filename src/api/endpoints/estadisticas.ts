import { apiClient } from '../client';
import type { Estadisticas } from '../../types/domain';

export const estadisticasApi = {
  getEstadisticas: (): Promise<Estadisticas> => {
    return apiClient.get<Estadisticas>('/estadisticas', 'estadisticas_mock.json');
  }
};
