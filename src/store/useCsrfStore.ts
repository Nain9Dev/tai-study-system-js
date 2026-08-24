import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CsrfState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useCsrfStore = create<CsrfState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    { name: 'csrf-token' }
  )
);
