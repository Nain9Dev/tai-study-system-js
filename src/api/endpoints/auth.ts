import { apiClient, ApiError } from '../client';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  user: UserProfile;
  csrfToken?: string;
}

const mockAuthResponse = (nombre: string, email: string): AuthResponse => ({
  user: {
    id: Date.now(),
    nombre,
    email,
    rol: 'student'
  },
  csrfToken: 'mock-csrf-token'
});

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse, any>('/auth/login', { email, password });
      if (!res) return mockAuthResponse('Usuario Local', email);
      return res;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 503 || error.status === 404)) {
        return mockAuthResponse('Usuario Local', email);
      }
      throw error;
    }
  },
  
  register: async (nombre: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse, any>('/auth/register', { nombre, email, password });
      if (!res) return mockAuthResponse(nombre, email);
      return res;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 503 || error.status === 404)) {
        return mockAuthResponse(nombre, email);
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      // Ignoramos error al hacer logout, simplemente se borrará la cookie si el backend responde
      console.warn("Error during logout on backend", error);
    }
  }
};
