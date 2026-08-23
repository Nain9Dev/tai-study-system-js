import { useStudyStore } from '../store/useStudyStore';

export function usePreguntas() {
  const isLoading = useStudyStore((state) => state.isLoading);
  const error = useStudyStore((state) => state.error);
  const isOfflineMode = useStudyStore((state) => state.isOfflineMode);
  const fetchPreguntas = useStudyStore((state) => state.fetchPreguntas);

  return {
    isLoading,
    error,
    isOfflineMode,
    fetchPreguntas,
  };
}
