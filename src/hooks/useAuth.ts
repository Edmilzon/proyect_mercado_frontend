import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, LoginRequest, RegisterRequest } from '@/types';
import { authService } from '@/services/auth';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  // Estado
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial - se cargará desde localStorage
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);
          
          set({
            user: response.usuario,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al iniciar sesión',
          });
          throw error;
        }
      },

      // Registro
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(userData);
          
          set({
            user: response.usuario,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al registrarse',
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Obtener perfil
      getProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.getProfile();
          
          set({
            user: response.usuario,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al obtener perfil',
            isAuthenticated: false,
          });
        }
      },

      // Limpiar error
      clearError: () => {
        set({ error: null });
      },

      // Establecer loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Verificar si el estado se cargó correctamente
        if (state) {
          // Asegurar que isAuthenticated sea true si hay token y usuario
          if (state.token && state.user && !state.isAuthenticated) {
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);

// Hook personalizado para verificar autenticación al cargar la app
export const useAuthInit = () => {
  const { token, isAuthenticated, getProfile } = useAuth();

  // Verificar si hay token al cargar la app
  React.useEffect(() => {
    if (token && !isAuthenticated) {
      getProfile();
    }
  }, [token, isAuthenticated, getProfile]);
};

// Hook para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    isAdmin: user?.rol === 'admin' || user?.rol === 'super_admin',
    isSeller: user?.rol === 'vendedor',
    isBuyer: user?.rol === 'comprador',
    hasRole: (role: string) => user?.rol === role,
    canAccess: (allowedRoles: string[]) => user ? allowedRoles.includes(user.rol) : false,
  };
};

export default useAuth; 