import { useMutation } from '@tanstack/react-query';
import { preguntasApi } from '../api/endpoints/preguntas';
import { apiClient } from '../api/client';
import { useStudyStore } from '../store/useStudyStore';

export function usePreguntas() {
  const startTest = useStudyStore((state) => state.startTest);
  
  return useMutation({
    mutationFn: async (bloque: string) => {
      const data = bloque && bloque !== 'all'
        ? await preguntasApi.getPreguntasByBloque(bloque)
        : await preguntasApi.getPreguntas();
      
      const isOfflineMode = apiClient.getMode() === 'static';
      return { data, isOfflineMode };
    },
    onSuccess: (result) => {
      startTest(result.data);
    },
  });
}
