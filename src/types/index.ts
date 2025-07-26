// Tipos principales basados en la base de datos

export interface Usuario {
  usuario_id: string;
  email: string;
  nombre: string;
  apellido: string;
  numero_telefono: string;
  rol: 'comprador' | 'vendedor' | 'admin' | 'super_admin';
  esta_activo: boolean;
  avatar_url?: string;
  ultima_sesion_at?: string;
  creado_at: string;
  actualizado_at: string;
}

export interface DireccionUsuario {
  direccion_id: string;
  usuario_id: string;
  etiqueta?: string;
  calle_avenida: string;
  ciudad: string;
  departamento: string;
  codigo_postal?: string;
  pais: string;
  latitud: number;
  longitud: number;
  es_predeterminada: boolean;
  creado_at: string;
  actualizado_at: string;
}

export interface Vendedor {
  vendedor_id: string;
  numero_identificacion: string;
  estado_onboarding: 'pendiente' | 'aprobado' | 'rechazado';
  latitud_actual?: number;
  longitud_actual?: number;
  ultima_actualizacion_ubicacion?: string;
  calificacion_promedio: number;
  total_resenas: number;
  tasa_comision: number;
  zona_asignada_id?: string;
  creado_at: string;
  actualizado_at: string;
  // Relación con usuario
  usuario?: Usuario;
}

export interface ZonaEntrega {
  zona_id: string;
  nombre: string;
  descripcion?: string;
  coordenadas_poligono: string;
  tarifa_envio: number;
  esta_activa: boolean;
  creado_at: string;
  actualizado_at: string;
}

export interface CategoriaProducto {
  categoria_id: string;
  nombre: string;
  descripcion?: string;
  categoria_padre_id?: string;
  creado_at: string;
  actualizado_at: string;
  // Relaciones
  categoria_padre?: CategoriaProducto;
  subcategorias?: CategoriaProducto[];
}

export interface Producto {
  producto_id: string;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  precio_actual: number;
  categoria_id: string;
  cantidad_stock: number;
  url_imagen_principal?: string;
  esta_activo: boolean;
  sku: string;
  peso_g?: number;
  creado_at: string;
  actualizado_at: string;
  // Relaciones
  categoria?: CategoriaProducto;
  imagenes?: ImagenProducto[];
}

export interface ImagenProducto {
  imagen_id: string;
  producto_id: string;
  url_imagen: string;
  orden_indice?: number;
  creado_at: string;
}

export interface Pedido {
  pedido_id: string;
  comprador_id: string;
  vendedor_id?: string;
  direccion_entrega_id: string;
  fecha_pedido: string;
  monto_total: number;
  costo_envio: number;
  monto_descuento: number;
  monto_final: number;
  estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'en_ruta' | 'entregado' | 'cancelado' | 'reembolsado';
  hora_estimada_entrega?: string;
  hora_real_entrega?: string;
  notas_comprador?: string;
  notas_vendedor?: string;
  whatsapp_pedido_id?: string;
  url_codigo_qr?: string;
  creado_at: string;
  actualizado_at: string;
  // Relaciones
  comprador?: Usuario;
  vendedor?: Vendedor;
  direccion_entrega?: DireccionUsuario;
  items?: ItemPedido[];
  pago?: Pago;
}

export interface ItemPedido {
  item_pedido_id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_en_compra: number;
  total_item_precio: number;
  creado_at: string;
  // Relaciones
  producto?: Producto;
}

export interface Pago {
  pago_id: string;
  pedido_id: string;
  transaccion_id: string;
  monto: number;
  moneda: string;
  metodo_pago: 'codigo_qr' | 'transferencia_bancaria' | 'efectivo_contra_entrega' | 'tarjeta' | 'billetera_movil';
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado' | 'cancelado';
  fecha_pago: string;
  procesado_por?: string;
  notas?: string;
  creado_at: string;
  actualizado_at: string;
}

export interface Resena {
  resena_id: string;
  pedido_id: string;
  comprador_id: string;
  vendedor_id: string;
  calificacion: number;
  comentario?: string;
  fecha_resena: string;
  respuesta_vendedor?: string;
  fecha_respuesta?: string;
  creado_at: string;
  actualizado_at: string;
  // Relaciones
  comprador?: Usuario;
  vendedor?: Vendedor;
}

export interface UbicacionVendedor {
  ubicacion_id: string;
  vendedor_id: string;
  pedido_id?: string;
  latitud: number;
  longitud: number;
  timestamp_ubicacion: string;
  precision_m?: number;
}

export interface Conversacion {
  conversacion_id: string;
  pedido_id?: string;
  tipo_conversacion: 'directa' | 'grupo';
  ultimo_mensaje_at: string;
  estado: 'activa' | 'archivada' | 'cerrada';
  creado_at: string;
  actualizado_at: string;
  // Relaciones
  participantes?: ParticipanteConversacion[];
  mensajes?: Mensaje[];
}

export interface ParticipanteConversacion {
  participante_id: string;
  conversacion_id: string;
  usuario_id: string;
  fecha_union: string;
  fecha_salida?: string;
  es_admin_conversacion: boolean;
  ultimo_visto_at: string;
  // Relaciones
  usuario?: Usuario;
}

export interface Mensaje {
  mensaje_id: string;
  conversacion_id: string;
  remitente_id: string;
  contenido: string;
  tipo_mensaje: 'texto' | 'imagen' | 'archivo' | 'sistema';
  url_archivo?: string;
  es_leido: boolean;
  enviado_at: string;
  // Relaciones
  remitente?: Usuario;
}

// Tipos para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  numero_telefono: string;
  rol: 'comprador' | 'vendedor' | 'admin' | 'super_admin';
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 