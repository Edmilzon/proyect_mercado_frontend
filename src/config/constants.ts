export const APP_CONSTANTS = {
  APP_NAME: 'Admin Ventas',
  CURRENCY: 'BOB',
  CART_STORAGE_KEY: 'carrito-storage',
  AUTH_STORAGE_KEY: 'auth-storage'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/productos',
  PAYMENT: '/pago',
  ABOUT: '/about',
  CONTACT: '/contacto',
  PRODUCT_DETAIL: '/producto',
  ADMIN: '/admin',
} as const; 