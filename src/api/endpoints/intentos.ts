import { apiClient } from '../client';
import type { Intento } from '../../types/domain';

export const intentosApi = {
  saveIntento: (intento: Intento): Promise<Intento | null> => {
    return apiClient.post<Intento, Intento>('/progreso', intento);
  },

  getHistorial: (): Promise<Intento[]> => {
    return apiClient.get<Intento[]>('/progreso/historial', 'intentos_mock.json');
  }
};
