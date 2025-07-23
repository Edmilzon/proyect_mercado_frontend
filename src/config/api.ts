export const API_CONFIG = {
  BASE_URL: 'https://admi-ventas-backend.onrender.com',
  ENDPOINTS: {
    USUARIOS: '/usuarios',
    PRODUCTOS: '/productos',
    AUTH: {
      LOGIN: '/usuarios/login',
      REGISTER: '/usuarios/registro'
    },
    VENTAS: '/ventas',
  }
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 