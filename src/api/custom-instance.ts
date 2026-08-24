import { apiClient } from './client';

/**
 * Custom instance for Orval-generated hooks.
 * Orval calls this as: customInstance(url, requestInit)
 */
export const customInstance = <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const method = (options?.method || 'GET').toUpperCase();

  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    return apiClient.post(url, body) as Promise<T>;
  }

  return apiClient.get(url);
};
