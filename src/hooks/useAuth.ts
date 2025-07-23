"use client";
import { useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { loginUser as loginUserApi, registerUser, logoutUser } from "@/lib/api/services/auth";
import { LoginPayload, RegisterPayload, User } from "@/types/auth";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

// Definir un tipo parcial para el usuario recibido
interface PartialUser {
  id: number;
  nombre: string;
  correo: string;
  direccion?: string;
  telf?: string;
}

export function useAuth() {
  const { isAuthenticated, user, token, isAdmin, login, logout, updateUser } = useAuthStore();

  const loginUser = async (payload: LoginPayload) => {
    // Lógica especial para admin
    if (
      payload.correo === 'admi@admi' &&
      payload.contrasena === 'admi123'
    ) {
      // Usuario admin
      login('admin-token', {
        id: 0,
        nombre: 'Administrador',
        correo: 'admi',
        direccion: '',
        telf: '',
        isAdmin: true,
      }, true);
      return { success: true };
    }
    try {
      const response = await loginUserApi(payload);
      if (response.user) {
        const fullUser: User = {
          id: response.user.id,
          nombre: response.user.nombre,
          correo: response.user.correo,
          direccion: (response.user as PartialUser).direccion || "",
          telf: (response.user as PartialUser).telf || "",
        };
        login(response.token, fullUser, false);
      }
      return { success: true };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const registerHandler = useCallback(async (userData: RegisterPayload) => {
    try {
      await registerUser(userData);
      return { success: true };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.response?.data?.message || 'Error al registrar usuario' 
      };
    }
  }, []);

  const logoutHandler = useCallback(() => {
    logoutUser();
    logout();
  }, [logout]);

  return {
    isAuthenticated,
    user,
    token,
    isAdmin,
    login: loginUser,
    register: registerHandler,
    logout: logoutHandler,
    updateUser,
  };
} 