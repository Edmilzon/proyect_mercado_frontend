import { ApiService } from './api';

export interface BuyerPurchaseHistory {
  pedidos: any[];
  total: number;
}

export interface BuyerFavorites {
  favoritos: any[];
}

export interface BuyerNotifications {
  notificaciones: any[];
  total: number;
}

export interface BuyerStatistics {
  total_pedidos: number;
  pedidos_entregados: number;
  total_gastado: number;
  productos_favoritos: number;
  notificaciones_no_leidas: number;
}

export interface DiscountCodeValidation {
  valido: boolean;
  codigo_descuento?: any;
  monto_descuento?: number;
}

export interface OrderTracking {
  pedido: any;
  tiempo_estimado: string;
  estado_detallado: string;
}

class BuyerService extends ApiService {
  /**
   * Obtener historial de compras del comprador (API 92)
   */
  async getPurchaseHistory(
    usuarioId: string, 
    filters?: {
      estado?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<BuyerPurchaseHistory> {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/compradores/${usuarioId}/historial-compras${queryString ? `?${queryString}` : ''}`;
    
    return this.get(url);
  }

  /**
   * Agregar producto a favoritos (API 93)
   */
  async addToFavorites(usuarioId: string, productoId: string): Promise<any> {
    return this.post('/compradores/favoritos', {
      usuario_id: usuarioId,
      producto_id: productoId
    });
  }

  /**
   * Listar productos favoritos (API 94)
   */
  async getFavorites(usuarioId: string): Promise<BuyerFavorites> {
    return this.get(`/compradores/${usuarioId}/favoritos`);
  }

  /**
   * Eliminar producto de favoritos (API 95)
   */
  async removeFromFavorites(usuarioId: string, productoId: string): Promise<any> {
    return this.delete(`/compradores/${usuarioId}/favoritos/${productoId}`);
  }

  /**
   * Verificar si producto está en favoritos (API 96)
   */
  async checkIfFavorite(usuarioId: string, productoId: string): Promise<{ es_favorito: boolean }> {
    return this.get(`/compradores/${usuarioId}/favoritos/verificar/${productoId}`);
  }

  /**
   * Listar notificaciones del comprador (API 97)
   */
  async getNotifications(
    usuarioId: string,
    filters?: {
      es_leida?: boolean;
      tipo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<BuyerNotifications> {
    const params = new URLSearchParams();
    if (filters?.es_leida !== undefined) params.append('es_leida', filters.es_leida.toString());
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/compradores/${usuarioId}/notificaciones${queryString ? `?${queryString}` : ''}`;
    
    return this.get(url);
  }

  /**
   * Marcar notificación como leída (API 98)
   */
  async markNotificationAsRead(notificationId: string): Promise<any> {
    return this.put(`/compradores/notificaciones/${notificationId}/leer`);
  }

  /**
   * Marcar todas las notificaciones como leídas (API 99)
   */
  async markAllNotificationsAsRead(usuarioId: string): Promise<any> {
    return this.put(`/compradores/${usuarioId}/notificaciones/todas-leidas`);
  }

  /**
   * Obtener contador de notificaciones no leídas (API 100)
   */
  async getUnreadNotificationsCount(usuarioId: string): Promise<{ notificaciones_no_leidas: number }> {
    return this.get(`/compradores/${usuarioId}/notificaciones/contador`);
  }

  /**
   * Validar código de descuento (API 101)
   */
  async validateDiscountCode(
    codigo: string,
    montoSubtotal: number,
    categoriaId?: string
  ): Promise<DiscountCodeValidation> {
    const data: any = {
      codigo,
      monto_subtotal: montoSubtotal
    };
    
    if (categoriaId) {
      data.categoria_id = categoriaId;
    }

    return this.post('/compradores/codigos-descuento/validar', data);
  }

  /**
   * Seguimiento detallado de pedido (API 102)
   */
  async getOrderTracking(usuarioId: string, pedidoId: string): Promise<OrderTracking> {
    return this.get(`/compradores/${usuarioId}/seguimiento-pedido/${pedidoId}`);
  }

  /**
   * Estadísticas del comprador (API 103)
   */
  async getBuyerStatistics(usuarioId: string): Promise<BuyerStatistics> {
    return this.get(`/compradores/${usuarioId}/estadisticas`);
  }

  /**
   * Listar pedidos del usuario autenticado (API 41)
   */
  async getMyOrders(): Promise<any[]> {
    return this.get('/pedidos/mis-pedidos');
  }

  /**
   * Crear reseña (API 53)
   */
  async createReview(data: {
    pedido_id: string;
    comprador_id: string;
    vendedor_id: string;
    calificacion: number;
    comentario?: string;
  }): Promise<any> {
    return this.post('/resenas', data);
  }

  /**
   * Listar reseñas del comprador (API 57)
   */
  async getMyReviews(compradorId: string): Promise<any[]> {
    return this.get(`/resenas/comprador/${compradorId}`);
  }

  /**
   * Listar reseñas pendientes del comprador (API 58)
   */
  async getPendingReviews(compradorId: string): Promise<any[]> {
    return this.get(`/resenas/pendientes/${compradorId}`);
  }

  /**
   * Actualizar reseña (API 61)
   */
  async updateReview(reviewId: string, data: {
    calificacion?: number;
    comentario?: string;
  }): Promise<any> {
    return this.put(`/resenas/${reviewId}`, data);
  }

  /**
   * Eliminar reseña (API 62)
   */
  async deleteReview(reviewId: string): Promise<any> {
    return this.delete(`/resenas/${reviewId}`);
  }
}

export const buyerService = new BuyerService(); 