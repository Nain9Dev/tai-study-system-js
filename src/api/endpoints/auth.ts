import { apiClient } from '../client';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse, any>('/auth/login', { email, password }).then(res => res as AuthResponse);
  },
  
  register: (nombre: string, email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse, any>('/auth/register', { nombre, email, password }).then(res => res as AuthResponse);
  }
};
