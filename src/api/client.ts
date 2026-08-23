// src/api/client.ts
import { offlineQueue } from './offlineQueue';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

type ConnectionMode = 'local' | 'static' | 'loading';

class ApiClient {
  private static instance: ApiClient;
  private mode: ConnectionMode = 'loading';
  private readonly baseUrl = (() => {
    let url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5298/api';
    url = url.replace(/\/+$/, ''); // Remove trailing slashes
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  })();
  private readonly staticBaseUrl = import.meta.env.BASE_URL + 'data';

  private constructor() {
    // Escuchar cuando vuelva el internet para intentar vaciar la cola
    window.addEventListener('online', () => this.syncOfflineQueue());
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public setOfflineMode() {
    this.mode = 'static';
  }

  public getMode(): ConnectionMode {
    return this.mode;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Clave para enviar la Cookie HttpOnly automáticamente
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  private handleHttpError(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Dispara evento para que el frontend haga logout
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new ApiError(401, 'No autorizado o sesión expirada. Inicie sesión nuevamente.');
      }
      if (response.status === 404) throw new ApiError(404, 'Recurso no encontrado.');
      if (response.status >= 500) throw new ApiError(response.status, 'Error interno del servidor.');
      throw new ApiError(response.status, `Error HTTP: ${response.status}`);
    }
  }

  public async get<T>(path: string, staticFallbackFile?: string): Promise<T> {
    // If we already know we are offline and have a fallback, use it
    if (this.mode === 'static' && staticFallbackFile) {
      return this.fetchStatic<T>(staticFallbackFile);
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${path}`);
      this.handleHttpError(response);
      this.mode = 'local';
      return await response.json();
    } catch (error) {
      console.warn(`[ApiClient] GET ${path} failed. Fallback to static if available.`, error);
      this.mode = 'static';
      if (staticFallbackFile) {
        return this.fetchStatic<T>(staticFallbackFile);
      }
      throw error;
    }
  }

  public async post<T, D>(path: string, data: D): Promise<T | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${path}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.handleHttpError(response);
      this.mode = 'local';
      
      // Si fue exitoso, intentar sincronizar cola pendiente
      this.syncOfflineQueue();
      
      // Si la respuesta es vacía, no intentar parsear JSON
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error: any) {
      console.warn(`[ApiClient] POST ${path} failed. Cannot fallback POST requests.`, error);
      
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isAbortError = error.name === 'AbortError';
      
      // Si es un error de red o timeout, lo añadimos a la cola offline (excepto peticiones de login/registro)
      if ((isNetworkError || isAbortError || this.mode === 'static') && !path.includes('/auth/')) {
        offlineQueue.addRequest(path, 'POST', data);
        this.mode = 'static';
        return null; // Resolvemos silenciosamente para que la UI no crashee
      }
      
      throw error; // Errores de negocio (400, 401, 500) se lanzan normal
    }
  }

  public async syncOfflineQueue() {
    const requests = offlineQueue.getPendingRequests();
    if (requests.length === 0) return;

    console.info(`[ApiClient] Sincronizando cola offline: ${requests.length} peticiones pendientes`);
    
    for (const req of requests) {
      try {
        const response = await this.fetchWithTimeout(`${this.baseUrl}${req.path}`, {
          method: req.method,
          body: JSON.stringify(req.body),
        });
        
        if (response.ok) {
          offlineQueue.removeRequest(req.id);
        } else if (response.status >= 400 && response.status < 500) {
          // Errores de cliente (ej. 400 Bad Request, 401 Unauthorized), la petición es inválida y no se reintentará
          console.warn(`[ApiClient] Eliminando petición inválida de la cola (HTTP ${response.status})`);
          offlineQueue.removeRequest(req.id);
        }
      } catch (error) {
        // Fallo de red nuevamente, abortamos sincronización por ahora
        console.warn(`[ApiClient] Sincronización abortada por fallo de red`);
        break; 
      }
    }
  }

  private async fetchStatic<T>(fileName: string): Promise<T> {
    const response = await fetch(`${this.staticBaseUrl}/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load static mock file: ${fileName}`);
    }
    return await response.json();
  }
}

export const apiClient = ApiClient.getInstance();
