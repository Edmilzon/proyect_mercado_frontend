import { ChatMessage, ChatEvent, TypingEvent } from '@/types';

export class WebSocketService {
  private socket: any = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();
  private messageQueue: any[] = [];

  constructor() {
    // Inicializar socket.io solo en el cliente
    if (typeof window !== 'undefined') {
      this.initializeSocket();
    }
  }

  private initializeSocket() {
    try {
      // Importar socket.io dinámicamente solo en el cliente
      import('socket.io-client').then(({ io }) => {
        this.socket = io('https://proyect-mercado-backend.fly.dev', {
          transports: ['websocket', 'polling'],
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.setupEventListeners();
      });
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      this.emit('user_connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Eventos de chat
    this.socket.on('new_message', (data: ChatMessage) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_read', (data: { conversacion_id: string; usuario_id: string }) => {
      this.emit('message_read', data);
    });

    this.socket.on('user_typing', (data: TypingEvent) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_online', (data: { usuario_id: string }) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data: { usuario_id: string }) => {
      this.emit('user_offline', data);
    });
  }

  /**
   * Conectar al WebSocket con autenticación
   */
  connect(token: string, usuarioId: string) {
    if (!this.socket) {
      this.initializeSocket();
      return;
    }

    // Configurar autenticación
    this.socket.auth = {
      token,
      usuario_id: usuarioId
    };

    this.socket.connect();
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Enviar mensaje
   */
  sendMessage(conversacionId: string, contenido: string, tipoMensaje: string = 'texto', urlArchivo?: string) {
    const message = {
      conversacion_id: conversacionId,
      contenido,
      tipo_mensaje: tipoMensaje,
      url_archivo: urlArchivo
    };

    if (this.isConnected) {
      this.socket.emit('send_message', message);
    } else {
      this.messageQueue.push({ type: 'send_message', data: message });
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  markMessagesAsRead(conversacionId: string) {
    if (this.isConnected) {
      this.socket.emit('mark_read', { conversacion_id: conversacionId });
    }
  }

  /**
   * Enviar indicador de escritura
   */
  sendTypingIndicator(conversacionId: string, isTyping: boolean) {
    if (this.isConnected) {
      this.socket.emit('typing', {
        conversacion_id: conversacionId,
        is_typing: isTyping
      });
    }
  }

  /**
   * Unirse a una conversación
   */
  joinConversation(conversacionId: string) {
    if (this.isConnected) {
      this.socket.emit('join_conversation', { conversacion_id: conversacionId });
    }
  }

  /**
   * Salir de una conversación
   */
  leaveConversation(conversacionId: string) {
    if (this.isConnected) {
      this.socket.emit('leave_conversation', { conversacion_id: conversacionId });
    }
  }

  /**
   * Procesar cola de mensajes pendientes
   */
  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift();
      
      if (queuedMessage.type === 'send_message') {
        this.socket.emit('send_message', queuedMessage.data);
      }
    }
  }

  /**
   * Agregar listener de eventos
   */
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remover listener de eventos
   */
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento interno
   */
  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Limpiar todos los listeners
   */
  clearListeners() {
    this.eventListeners.clear();
  }
}

// Instancia singleton
export const websocketService = new WebSocketService(); 