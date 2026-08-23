import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isOfflineMode: boolean;
  refetch: () => Promise<void>;
}

export function useApi<T>(endpoint: string, staticFallbackFile?: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<T>(endpoint, staticFallbackFile);
      setData(result);
      setIsOfflineMode(apiClient.getMode() === 'static');
    } catch (err: any) {
      setError(err.message || 'Error desconocido al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, isLoading, error, isOfflineMode, refetch: fetchData };
}
