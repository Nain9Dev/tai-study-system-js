import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/endpoints/auth';
import type { UserProfile } from '../api/endpoints/auth';
import { useCsrfStore } from './useCsrfStore';

interface AuthState {
  user: UserProfile | null;
  isGuest: boolean;
  
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,

      isAuthenticated: () => !!get().user,

      login: async (email, password) => {
        const response = await authApi.login(email, password);
        if (response.csrfToken) {
          useCsrfStore.getState().setToken(response.csrfToken);
        }
        set({ user: response.user, isGuest: false });
      },

      register: async (nombre, email, password) => {
        const response = await authApi.register(nombre, email, password);
        if (response.csrfToken) {
          useCsrfStore.getState().setToken(response.csrfToken);
        }
        set({ user: response.user, isGuest: false });
      },

      logout: async () => {
        await authApi.logout();
        useCsrfStore.getState().clearToken();
        set({ user: null, isGuest: false });
      },

      continueAsGuest: () => {
        set({ user: null, isGuest: true });
      }
    }),
    {
      name: 'nain_tai_auth_v1',
    }
  )
);

// Listener para errores 401 desde el cliente API
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
