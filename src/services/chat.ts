import { ApiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import {
  Conversacion,
  ParticipanteConversacion,
  Mensaje,
  CreateConversacionRequest,
  UpdateConversacionRequest,
  CreateMensajeRequest,
  UpdateMensajeRequest,
  ConversacionFilters,
} from '@/types';

class ChatService extends ApiService {
  // ===== CONVERSACIONES =====

  /**
   * Crear una nueva conversación
   */
  async createConversacion(data: CreateConversacionRequest): Promise<Conversacion> {
    return this.post<Conversacion>(API_ENDPOINTS.CHAT.CONVERSACIONES.BASE, data);
  }

  /**
   * Obtener todas las conversaciones
   */
  async getConversaciones(): Promise<Conversacion[]> {
    return this.get<Conversacion[]>(API_ENDPOINTS.CHAT.CONVERSACIONES.BASE);
  }

  /**
   * Buscar conversaciones con filtros
   */
  async searchConversaciones(filters: ConversacionFilters): Promise<{ conversaciones: Conversacion[]; total: number }> {
    const params = new URLSearchParams();
    
    if (filters.pedido_id) params.append('pedido_id', filters.pedido_id);
    if (filters.tipo_conversacion) params.append('tipo_conversacion', filters.tipo_conversacion);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.CHAT.CONVERSACIONES.SEARCH}?${queryString}` : API_ENDPOINTS.CHAT.CONVERSACIONES.SEARCH;
    
    return this.get<{ conversaciones: Conversacion[]; total: number }>(url);
  }

  /**
   * Obtener conversaciones de un usuario
   */
  async getConversacionesByUser(usuarioId: string): Promise<Conversacion[]> {
    return this.get<Conversacion[]>(API_ENDPOINTS.CHAT.CONVERSACIONES.BY_USER(usuarioId));
  }

  /**
   * Obtener conversación por ID
   */
  async getConversacionById(conversacionId: string): Promise<Conversacion> {
    return this.get<Conversacion>(API_ENDPOINTS.CHAT.CONVERSACIONES.BY_ID(conversacionId));
  }

  /**
   * Actualizar estado de conversación
   */
  async updateConversacionStatus(conversacionId: string, data: UpdateConversacionRequest): Promise<Conversacion> {
    return this.put<Conversacion>(API_ENDPOINTS.CHAT.CONVERSACIONES.UPDATE_STATUS(conversacionId), data);
  }

  /**
   * Agregar participante a conversación
   */
  async addParticipant(conversacionId: string, usuarioId: string): Promise<ParticipanteConversacion> {
    return this.post<ParticipanteConversacion>(API_ENDPOINTS.CHAT.CONVERSACIONES.ADD_PARTICIPANT(conversacionId), {
      usuario_id: usuarioId
    });
  }

  /**
   * Remover participante de conversación
   */
  async removeParticipant(conversacionId: string, usuarioId: string): Promise<void> {
    return this.delete(API_ENDPOINTS.CHAT.CONVERSACIONES.REMOVE_PARTICIPANT(conversacionId, usuarioId));
  }

  // ===== MENSAJES =====

  /**
   * Crear un nuevo mensaje
   */
  async createMensaje(data: CreateMensajeRequest): Promise<Mensaje> {
    return this.post<Mensaje>(API_ENDPOINTS.CHAT.MENSAJES.BASE, data);
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMensajesByConversacion(conversacionId: string): Promise<Mensaje[]> {
    return this.get<Mensaje[]>(API_ENDPOINTS.CHAT.MENSAJES.BY_CONVERSATION(conversacionId));
  }

  /**
   * Obtener mensaje por ID
   */
  async getMensajeById(mensajeId: string): Promise<Mensaje> {
    return this.get<Mensaje>(API_ENDPOINTS.CHAT.MENSAJES.BY_ID(mensajeId));
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMensajesAsRead(conversacionId: string): Promise<void> {
    return this.put(API_ENDPOINTS.CHAT.MENSAJES.MARK_READ(conversacionId));
  }

  /**
   * Obtener mensajes no leídos de un usuario
   */
  async getUnreadMensajes(usuarioId: string): Promise<Mensaje[]> {
    return this.get<Mensaje[]>(API_ENDPOINTS.CHAT.MENSAJES.UNREAD_BY_USER(usuarioId));
  }

  /**
   * Eliminar mensaje
   */
  async deleteMensaje(mensajeId: string): Promise<void> {
    return this.delete(API_ENDPOINTS.CHAT.MENSAJES.BY_ID(mensajeId));
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Obtener conversación o crear nueva si no existe
   */
  async getOrCreateConversacion(
    pedidoId: string | undefined,
    participantes: string[],
    tipoConversacion: 'directa' | 'grupo' = 'directa'
  ): Promise<Conversacion> {
    try {
      // Buscar conversación existente
      const filters: ConversacionFilters = {
        pedido_id: pedidoId,
        tipo_conversacion: tipoConversacion,
        estado: 'activa'
      };
      
      const { conversaciones } = await this.searchConversaciones(filters);
      
      // Si existe una conversación activa, retornarla
      if (conversaciones.length > 0) {
        return conversaciones[0];
      }
      
      // Si no existe, crear nueva conversación
      const nuevaConversacion = await this.createConversacion({
        pedido_id: pedidoId,
        tipo_conversacion: tipoConversacion,
        participantes
      });
      
      return nuevaConversacion;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  /**
   * Obtener conversación entre dos usuarios
   */
  async getConversacionBetweenUsers(usuario1Id: string, usuario2Id: string): Promise<Conversacion | null> {
    try {
      const conversaciones1 = await this.getConversacionesByUser(usuario1Id);
      const conversaciones2 = await this.getConversacionesByUser(usuario2Id);
      
      // Encontrar conversación común
      const conversacionComun = conversaciones1.find(conv1 => 
        conversaciones2.some(conv2 => conv2.conversacion_id === conv1.conversacion_id)
      );
      
      return conversacionComun || null;
    } catch (error) {
      console.error('Error getting conversation between users:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de chat para un usuario
   */
  async getChatStats(usuarioId: string): Promise<{
    totalConversaciones: number;
    mensajesNoLeidos: number;
    conversacionesActivas: number;
  }> {
    try {
      const [conversaciones, mensajesNoLeidos] = await Promise.all([
        this.getConversacionesByUser(usuarioId),
        this.getUnreadMensajes(usuarioId)
      ]);
      
      const conversacionesActivas = conversaciones.filter(conv => conv.estado === 'activa').length;
      
      return {
        totalConversaciones: conversaciones.length,
        mensajesNoLeidos: mensajesNoLeidos.length,
        conversacionesActivas
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return {
        totalConversaciones: 0,
        mensajesNoLeidos: 0,
        conversacionesActivas: 0
      };
    }
  }
}

export const chatService = new ChatService(); 