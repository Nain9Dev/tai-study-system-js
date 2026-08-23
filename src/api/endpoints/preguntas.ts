import { apiClient } from '../client';
import type { Pregunta } from '../../types/domain';

export const preguntasApi = {
  getPreguntas: (): Promise<Pregunta[]> => {
    return apiClient.get<Pregunta[]>('/preguntas', 'preguntas.json');
  },

  getPreguntasByBloque: (bloque: string): Promise<Pregunta[]> => {
    return apiClient.get<Pregunta[]>(`/preguntas/bloque/${bloque}`, 'preguntas.json').then(preguntas => {
      // Si usamos el fallback local, simulamos el filtrado
      if (apiClient.getMode() === 'static') {
        return preguntas.filter(p => p.bloque?.toString() === bloque.toString());
      }
      return preguntas;
    });
  }
};
