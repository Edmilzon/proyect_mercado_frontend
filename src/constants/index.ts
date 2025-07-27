// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Proyecto Mercado',
  version: '1.0.0',
  description: 'Tienda en línea moderna y escalable'
};

// URL del backend
export const API_BASE_URL = 'https://proyect-mercado-backend.fly.dev/api';

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/autenticacion/login',
    REGISTER: '/usuarios/registro',
  },
  
  // Usuarios
  USERS: {
    PROFILE: '/usuarios/perfil',
    BY_ID: (id: string) => `/usuarios/${id}`,
    ADDRESSES: (id: string) => `/usuarios/${id}/direcciones`,
  },
  
  // Vendedores
  SELLERS: {
    BASE: '/vendedores',
    BY_ID: (id: string) => `/vendedores/${id}`,
    LOCATIONS: '/vendedores/ubicaciones',
    LOCATIONS_BY_ID: (id: string) => `/vendedores/${id}/ubicaciones`,
  },
  
  // Zonas
  ZONES: {
    BASE: '/zonas',
    ACTIVE: '/zonas/activas',
    BY_ID: (id: string) => `/zonas/${id}`,
  },
  
  // Categorías
  CATEGORIES: {
    BASE: '/categorias',
    PARENTS: '/categorias/padres',
    BY_ID: (id: string) => `/categorias/${id}`,
  },
  
  // Productos
  PRODUCTS: {
    BASE: '/productos',
    SEARCH: '/productos/buscar',
    BY_ID: (id: string) => `/productos/${id}`,
    STOCK: (id: string) => `/productos/${id}/stock`,
    IMAGES: (id: string) => `/productos/${id}/imagenes`,
  },
  
  // Pedidos
  ORDERS: {
    BASE: '/pedidos',
    MY_ORDERS: '/pedidos/mis-pedidos',
    BY_SELLER: (id: string) => `/pedidos/vendedor/${id}`,
    BY_ID: (id: string) => `/pedidos/${id}`,
    STATUS: (id: string) => `/pedidos/${id}/estado`,
  },
  
  // Pagos
  PAYMENTS: {
    BASE: '/pagos',
    BY_ID: (id: string) => `/pagos/${id}`,
    BY_ORDER: (id: string) => `/pagos/pedido/${id}`,
    STATUS: (id: string) => `/pagos/${id}/estado`,
    BY_STATUS: (status: string) => `/pagos/estado/${status}`,
    BY_METHOD: (method: string) => `/pagos/metodo/${method}`,
  },
  
  // Carrito
  CART: {
    CALCULATE: '/carrito/calcular',
    VALIDATE_STOCK: '/carrito/validar-stock',
    CALCULATE_SHIPPING: '/carrito/calcular-envio',
    CALCULATE_DISCOUNTS: '/carrito/calcular-descuentos',
    COMPLETE_SUMMARY: '/carrito/resumen-completo',
  },
  
  // Reseñas
      REVIEWS: {
      BASE: '/resenas',
      SEARCH: '/resenas/buscar',
      BY_SELLER: (id: string) => `/resenas/vendedor/${id}`,
      BY_BUYER: (id: string) => `/resenas/comprador/${id}`,
      PENDING: (id: string) => `/resenas/pendientes/${id}`,
      BY_ID: (id: string) => `/resenas/${id}`,
      RESPOND: (id: string) => `/resenas/${id}/responder`,
      SELLER_RATING: (id: string) => `/vendedores/${id}/calificacion`,
    },
    CHAT: {
      CONVERSACIONES: {
        BASE: '/conversaciones',
        SEARCH: '/conversaciones/buscar',
        BY_USER: (id: string) => `/conversaciones/usuario/${id}`,
        BY_ID: (id: string) => `/conversaciones/${id}`,
        UPDATE_STATUS: (id: string) => `/conversaciones/${id}/estado`,
        ADD_PARTICIPANT: (id: string) => `/conversaciones/${id}/participantes`,
        REMOVE_PARTICIPANT: (id: string, userId: string) => `/conversaciones/${id}/participantes/${userId}`,
      },
      MENSAJES: {
        BASE: '/mensajes',
        BY_CONVERSATION: (id: string) => `/mensajes/conversacion/${id}`,
        BY_ID: (id: string) => `/mensajes/${id}`,
        MARK_READ: (id: string) => `/mensajes/conversacion/${id}/leer`,
        UNREAD_BY_USER: (id: string) => `/mensajes/usuario/${id}/no-leidos`,
      },
    },
  
  // Zonas de entrega
  DELIVERY_ZONES: {
    BASE: '/zonas-entrega',
    ACTIVE: '/zonas-entrega/activas',
    BY_ID: (id: string) => `/zonas-entrega/${id}`,
    CALCULATE_FEE: '/zonas-entrega/calcular-tarifa',
    ASSIGN_SELLER: (id: string) => `/zonas-entrega/vendedores/${id}/asignar-zona`,
    SELLERS_BY_ZONE: (id: string) => `/zonas-entrega/${id}/vendedores`,
    OPTIMIZE_ROUTE: (id: string) => `/zonas-entrega/vendedores/${id}/optimizar-ruta`,
    SEARCH_BY_COORDINATES: '/zonas-entrega/buscar-por-coordenadas',
  },
};

// Estados de pedido
export const ORDER_STATUS = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmado',
  IN_PREPARATION: 'en_preparacion',
  IN_ROUTE: 'en_ruta',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
  REFUNDED: 'reembolsado',
} as const;

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'pendiente',
  COMPLETED: 'completado',
  FAILED: 'fallido',
  REFUNDED: 'reembolsado',
  CANCELLED: 'cancelado',
} as const;

// Métodos de pago
export const PAYMENT_METHODS = {
  QR_CODE: 'codigo_qr',
  BANK_TRANSFER: 'transferencia_bancaria',
  CASH_ON_DELIVERY: 'efectivo_contra_entrega',
  CARD: 'tarjeta',
  MOBILE_WALLET: 'billetera_movil',
} as const;

// Roles de usuario
export const USER_ROLES = {
  BUYER: 'comprador',
  SELLER: 'vendedor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Estados de onboarding de vendedor
export const SELLER_ONBOARDING_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
} as const;

// Tipos de mensaje
export const MESSAGE_TYPES = {
  TEXT: 'texto',
  IMAGE: 'imagen',
  FILE: 'archivo',
  SYSTEM: 'sistema',
} as const;

// Tipos de conversación
export const CONVERSATION_TYPES = {
  DIRECT: 'directa',
  GROUP: 'grupo',
} as const;

// Estados de conversación
export const CONVERSATION_STATUS = {
  ACTIVE: 'activa',
  ARCHIVED: 'archivada',
  CLOSED: 'cerrada',
} as const;

// Configuración de WebSocket
export const WEBSOCKET_CONFIG = {
  URL: 'wss://proyect-mercado-backend.fly.dev',
  EVENTS: {
    LOCATION_UPDATED: 'ubicacion_actualizada',
    MESSAGE_RECEIVED: 'mensaje_recibido',
    ORDER_STATUS_CHANGED: 'estado_pedido_cambiado',
  },
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
  THEME: 'theme',
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Configuración de validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^[0-9]{8,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Configuración de UI
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const; 