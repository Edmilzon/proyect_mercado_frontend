import apiClient from '../client';
import { RegisterPayload, LoginPayload, LoginResponse, User } from '@/types/auth';
import { User as UserModel } from '@/models';

// Simular registro (no hace nada)
export const registerUser = async (data: RegisterPayload): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/usuarios/registro', data);
  return response.data;
};

interface LoginApiResponse {
  token: string;
  usuario: User;
}

// Simular login exitoso para cualquier usuario/contraseña
export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginApiResponse>('/usuarios/login', data);
  const token = response.data.token;
  const user = response.data.usuario;
  if (token) {
    localStorage.setItem('auth-token', token);
  }
  return { token, user };
};

export const logoutUser = (): void => {
  localStorage.removeItem('auth-token');
};

export const getCurrentUser = async (): Promise<UserModel | null> => {
  try {
    const response = await apiClient.get<User>('/usuarios/me');
    return UserModel.fromApi(response.data);
  } catch {
    return null;
  }
}; 