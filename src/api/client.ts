// src/api/client.ts

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

  private constructor() {}

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

    // Read token from zustand persisted storage
    let token = null;
    try {
      const authState = localStorage.getItem('nain_tai_auth_v1');
      if (authState) {
        token = JSON.parse(authState).state?.token;
      }
    } catch(e) {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
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
    if (this.mode === 'static') {
      // Offline mode prevents real POST requests, simulates success
      return null;
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${path}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.handleHttpError(response);
      this.mode = 'local';
      return await response.json();
    } catch (error: any) {
      console.warn(`[ApiClient] POST ${path} failed. Cannot fallback POST requests.`, error);
      this.mode = 'static';
      // Si el error es de red o 404 (ej. en GitHub Pages), lanzamos un error más amigable
      if ((error instanceof TypeError && error.message.includes('fetch')) || (error instanceof ApiError && error.status === 404)) {
        throw new ApiError(503, 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución o continúa como invitado.');
      }
      throw error;
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
