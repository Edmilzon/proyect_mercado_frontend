import { ApiService } from './api';
import { Vendedor, CreateVendedorRequest } from '@/types';

export interface UpdateLocationRequest {
  vendedor_id: string;
  latitud: number;
  longitud: number;
  precision_m: number;
}

export interface SellerDashboard {
  total_productos: number;
  productos_activos: number;
  productos_sin_stock: number;
  total_pedidos: number;
  pedidos_pendientes: number;
  pedidos_confirmados: number;
  pedidos_en_preparacion: number;
  pedidos_en_ruta: number;
  pedidos_entregados: number;
  pedidos_cancelados: number;
  calificacion_promedio: number;
  total_resenas: number;
  resenas_pendientes: number;
  ventas_hoy: number;
  ventas_semana: number;
  ventas_mes: number;
  mensajes_no_leidos: number;
  conversaciones_activas: number;
}

export interface SellerInventory {
  total_productos: number;
  productos_bajo_stock: number;
  productos_sin_stock: number;
  valor_total_inventario: number;
  productos: any[];
}

export interface SellerSalesReport {
  periodo: string;
  total_ventas: number;
  total_pedidos: number;
  productos_mas_vendidos: any[];
  ventas_por_dia: any[];
}

class SellerService extends ApiService {
  /**
   * Convertir usuario normal en vendedor (API 7)
   */
  async convertToSeller(data: {
    usuario_id: string;
    numero_identificacion: string;
    estado_onboarding?: string;
    zona_asignada_id?: string;
  }): Promise<any> {
    return this.post('/vendedores/convertir-usuario', data);
  }

  /**
   * Registrar datos extra de vendedor (API 12)
   */
  async registerSeller(data: CreateVendedorRequest): Promise<Vendedor> {
    return this.post('/vendedores', data);
  }

  /**
   * Listar todos los vendedores (API 13)
   */
  async getAllSellers(): Promise<Vendedor[]> {
    return this.get('/vendedores');
  }

  /**
   * Obtener vendedor específico por ID (API 14)
   */
  async getSellerById(sellerId: string): Promise<Vendedor> {
    return this.get(`/vendedores/${sellerId}`);
  }

  /**
   * Obtener calificación detallada de un vendedor (API 15)
   */
  async getSellerRating(sellerId: string): Promise<any> {
    return this.get(`/vendedores/${sellerId}/calificacion`);
  }

  /**
   * Registrar ubicación de vendedor (API 16)
   */
  async updateSellerLocation(data: UpdateLocationRequest): Promise<any> {
    return this.post('/vendedores/ubicaciones', data);
  }

  /**
   * Listar ubicaciones históricas de vendedor (API 17)
   */
  async getSellerLocations(sellerId: string): Promise<any[]> {
    return this.get(`/vendedores/${sellerId}/ubicaciones`);
  }

  /**
   * Obtener dashboard completo del vendedor (API 8)
   */
  async getSellerDashboard(sellerId: string): Promise<SellerDashboard> {
    return this.get(`/vendedores/${sellerId}/dashboard`);
  }

  /**
   * Listar productos específicos del vendedor (API 9)
   */
  async getSellerProducts(sellerId: string, filters?: {
    esta_activo?: boolean;
    categoria_id?: string;
    nombre?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ productos: any[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.esta_activo !== undefined) params.append('esta_activo', filters.esta_activo.toString());
    if (filters?.categoria_id) params.append('categoria_id', filters.categoria_id);
    if (filters?.nombre) params.append('nombre', filters.nombre);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/vendedores/${sellerId}/productos${queryString ? `?${queryString}` : ''}`;
    return this.get(url);
  }

  /**
   * Listar pedidos específicos del vendedor (API 10)
   */
  async getSellerOrders(sellerId: string, filters?: {
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ pedidos: any[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/vendedores/${sellerId}/pedidos${queryString ? `?${queryString}` : ''}`;
    return this.get(url);
  }

  /**
   * Obtener chat específico de un pedido (API 11)
   */
  async getOrderChat(pedidoId: string, vendedorId: string): Promise<any> {
    return this.get(`/vendedores/pedidos/${pedidoId}/chat?vendedor_id=${vendedorId}`);
  }

  /**
   * Reporte detallado de ventas del vendedor (API 114)
   */
  async getSellerSalesReport(sellerId: string, fechaInicio?: string, fechaFin?: string): Promise<SellerSalesReport> {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryString = params.toString();
    const url = `/vendedores/${sellerId}/reportes/ventas${queryString ? `?${queryString}` : ''}`;
    return this.get(url);
  }

  /**
   * Gestión de inventario avanzada (API 115)
   */
  async getSellerInventory(sellerId: string): Promise<SellerInventory> {
    return this.get(`/vendedores/${sellerId}/inventario`);
  }

  /**
   * Listar reseñas del vendedor (API 56)
   */
  async getSellerReviews(sellerId: string): Promise<any[]> {
    return this.get(`/resenas/vendedor/${sellerId}`);
  }

  /**
   * Responder a una reseña (API 60)
   */
  async respondToReview(reviewId: string, respuesta: string): Promise<any> {
    return this.put(`/resenas/${reviewId}/responder`, {
      respuesta_vendedor: respuesta
    });
  }

  /**
   * Cambiar estado de un pedido (API 44)
   */
  async updateOrderStatus(pedidoId: string, data: {
    estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'en_ruta' | 'entregado' | 'cancelado' | 'reembolsado';
    notas_vendedor?: string;
    hora_estimada_entrega?: string;
  }): Promise<any> {
    return this.put(`/pedidos/${pedidoId}/estado`, data);
  }

  /**
   * Obtener pedido específico (API 43)
   */
  async getOrderById(pedidoId: string): Promise<any> {
    return this.get(`/pedidos/${pedidoId}`);
  }

  /**
   * Listar pedidos del vendedor (API 42)
   */
  async getVendorOrders(vendedorId: string): Promise<any[]> {
    return this.get(`/pedidos/vendedor/${vendedorId}`);
  }

  /**
   * Crear mensaje en chat (API 71)
   */
  async createMessage(data: {
    conversacion_id: string;
    contenido: string;
    tipo_mensaje: 'texto' | 'imagen' | 'archivo' | 'sistema';
    url_archivo?: string;
  }): Promise<any> {
    return this.post('/mensajes', data);
  }

  /**
   * Listar mensajes de conversación (API 72)
   */
  async getConversationMessages(conversacionId: string): Promise<any[]> {
    return this.get(`/mensajes/conversacion/${conversacionId}`);
  }

  /**
   * Marcar mensajes como leídos (API 74)
   */
  async markMessagesAsRead(conversacionId: string): Promise<any> {
    return this.put(`/mensajes/conversacion/${conversacionId}/leer`);
  }

  /**
   * Listar conversaciones del usuario (API 64)
   */
  async getUserConversations(): Promise<any[]> {
    return this.get('/conversaciones');
  }

  /**
   * Obtener conversación específica (API 67)
   */
  async getConversationById(conversacionId: string): Promise<any> {
    return this.get(`/conversaciones/${conversacionId}`);
  }
}

export const sellerService = new SellerService(); 