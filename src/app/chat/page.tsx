'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat';
import { websocketService } from '@/services/websocket';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import Navbar from '@/components/layout/Navbar';
import { Conversacion, Mensaje, ChatMessage } from '@/types';
import { 
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<Conversacion[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversacion | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Conectar WebSocket
  useEffect(() => {
    if (user && isAuthenticated) {
      // Conectar al WebSocket (sin token por ahora)
      websocketService.connect('', user.usuario_id);
      
      // Configurar listeners
      websocketService.on('new_message', handleNewMessage);
      websocketService.on('message_read', handleMessageRead);
      websocketService.on('user_typing', handleUserTyping);
      
      return () => {
        websocketService.off('new_message', handleNewMessage);
        websocketService.off('message_read', handleMessageRead);
        websocketService.off('user_typing', handleUserTyping);
      };
    }
  }, [user, isAuthenticated]);

  // Cargar conversaciones
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversacion_id);
      // Unirse a la conversación en WebSocket
      websocketService.joinConversation(selectedConversation.conversacion_id);
    }
  }, [selectedConversation]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const conversationsData = await chatService.getConversacionesByUser(user!.usuario_id);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Error al cargar las conversaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      
      const messagesData = await chatService.getMensajesByConversacion(conversationId);
      setMessages(messagesData);
      
      // Marcar mensajes como leídos
      await chatService.markMensajesAsRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Error al cargar los mensajes');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    // Solo agregar si pertenece a la conversación actual
    if (selectedConversation && message.conversacion_id === selectedConversation.conversacion_id) {
      setMessages(prev => [...prev, message as Mensaje]);
      
      // Marcar como leído si es de otro usuario
      if (message.remitente_id !== user?.usuario_id) {
        chatService.markMensajesAsRead(selectedConversation.conversacion_id);
      }
    }
    
    // Actualizar lista de conversaciones
    loadConversations();
  };

  const handleMessageRead = (data: { conversacion_id: string; usuario_id: string }) => {
    // Actualizar estado de lectura en mensajes
    setMessages(prev => 
      prev.map(msg => 
        msg.conversacion_id === data.conversacion_id && msg.remitente_id === user?.usuario_id
          ? { ...msg, es_leido: true }
          : msg
      )
    );
  };

  const handleUserTyping = (data: { conversacion_id: string; usuario_id: string; is_typing: boolean }) => {
    if (selectedConversation && data.conversacion_id === selectedConversation.conversacion_id) {
      setOtherUserTyping(data.is_typing);
    }
  };

  const handleSendMessage = async (content: string, type: 'texto' | 'imagen' | 'archivo', fileUrl?: string) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      const newMessage = await chatService.createMensaje({
        conversacion_id: selectedConversation.conversacion_id,
        contenido: content,
        tipo_mensaje: type,
        url_archivo: fileUrl
      });

      // Agregar mensaje a la lista local
      setMessages(prev => [...prev, newMessage]);
      
      // Enviar por WebSocket
      websocketService.sendMessage(
        selectedConversation.conversacion_id,
        content,
        type,
        fileUrl
      );
      
      // Actualizar conversaciones
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar el mensaje');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMensaje(messageId);
      setMessages(prev => prev.filter(msg => msg.mensaje_id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Error al eliminar el mensaje');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedConversation) {
      websocketService.sendTypingIndicator(selectedConversation.conversacion_id, isTyping);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = () => {
    if (!selectedConversation?.participantes) return null;
    
    return selectedConversation.participantes.find(
      p => p.usuario?.usuario_id !== user?.usuario_id
    )?.usuario;
  };

  if (!isAuthenticated) {
    return null; // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-[calc(100vh-64px)] flex">
        {/* Lista de conversaciones */}
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.conversacion_id}
            onSelectConversation={setSelectedConversation}
            onNewConversation={() => router.push('/chat/new')}
            isLoading={isLoading}
          />
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Header de la conversación */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.pedido_id 
                        ? `Pedido #${selectedConversation.pedido_id.slice(0, 8)}`
                        : getOtherParticipant()?.nombre || 'Conversación'
                      }
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.pedido_id 
                        ? 'Conversación sobre pedido'
                        : getOtherParticipant()?.email || ''
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {otherUserTyping && (
                    <span className="text-sm text-gray-500 italic">
                      Escribiendo...
                    </span>
                  )}
                  
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.mensaje_id}
                      message={message}
                      onDelete={handleDeleteMessage}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay mensajes aún</p>
                    <p className="text-sm text-gray-400 mt-1">
                      ¡Inicia la conversación!
                    </p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                placeholder="Escribe un mensaje..."
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500">
                  Elige una conversación para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 