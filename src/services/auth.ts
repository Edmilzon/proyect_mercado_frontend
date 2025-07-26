import { ApiService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS, API_BASE_URL } from '@/constants';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from '@/types';

export class AuthService extends ApiService {
  // Login de usuario
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login with:', { email: credentials.email });
    console.log('API URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
    
    try {
      const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      console.log('Login successful:', response);
      
      // Guardar token y datos del usuario en localStorage
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.usuario));
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Registro de usuario
  async register(userData: RegisterRequest): Promise<{ usuario: Usuario; token: string }> {
    const response = await this.post<{ usuario: Usuario; token: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    // Guardar token y datos del usuario en localStorage
    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.usuario));
    }
    
    return response;
  }

  // Obtener perfil del usuario autenticado
  async getProfile(): Promise<{ usuario: Usuario }> {
    return await this.get<{ usuario: Usuario }>(API_ENDPOINTS.USERS.PROFILE);
  }

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<{ usuario: Usuario }> {
    return await this.get<{ usuario: Usuario }>(API_ENDPOINTS.USERS.BY_ID(userId));
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Redirigir a login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  }

  // Obtener token actual
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Obtener datos del usuario actual
  getCurrentUser(): Usuario | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // Actualizar datos del usuario en localStorage
  updateCurrentUser(user: Usuario): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  // Verificar si el token ha expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar el token JWT (solo la parte del payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  // Renovar token (si es necesario)
  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.get<{ token: string }>('/auth/refresh');
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Verificar permisos del usuario
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }

  // Verificar si el usuario es admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'admin' || user?.rol === 'super_admin';
  }

  // Verificar si el usuario es vendedor
  isSeller(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'vendedor';
  }

  // Verificar si el usuario es comprador
  isBuyer(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'comprador';
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

export default authService; 