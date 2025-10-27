// frontend/lib/auth.ts
import { create } from 'zustand';
import api from './api'; // import cliente API

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.login(email, password);
    const { access_token, user } = response;

    // Armazena token para futuras requisições autenticadas
    localStorage.setItem('token', access_token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    // Remove token no logout
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const response = await api.getCurrentUser();
      set({ user: response, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
