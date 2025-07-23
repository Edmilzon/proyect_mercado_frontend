export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export interface RegisterPayload {
  correo: string;
  nombre: string;
  contrasena: string;
  direccion: string;
  telf: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    nombre: string;
    correo: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAdmin?: boolean;
}

export interface User {
  id: number;
  nombre: string;
  correo: string;
  direccion: string;
  telf: string;
  isAdmin?: boolean;
} 