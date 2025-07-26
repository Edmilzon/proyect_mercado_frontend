'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth';
import { STORAGE_KEYS } from '@/constants';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { token, isAuthenticated, getProfile, setLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Verificar si hay token en localStorage
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        
        if (storedToken && storedUser) {
          // Verificar si el token no ha expirado
          if (!authService.isTokenExpired()) {
            // Intentar obtener el perfil actualizado
            await getProfile();
          } else {
            // Token expirado, limpiar datos
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // En caso de error, limpiar datos
        authService.logout();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [getProfile, setLoading]);

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider; 