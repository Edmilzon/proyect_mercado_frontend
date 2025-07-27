'use client';

import React, { useState, useEffect } from 'react';
import { Conversacion, Mensaje } from '@/types';
import { chatService } from '@/services/chat';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChatBubbleLeftIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ConversationListProps {
  conversations: Conversacion[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversacion) => void;
  onNewConversation?: () => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Cargar conteos de mensajes no leídos
  useEffect(() => {
    const loadUnreadCounts = async () => {
      if (!user) return;

      try {
        const unreadMessages = await chatService.getUnreadMensajes(user.usuario_id);
        const counts: Record<string, number> = {};
        
        unreadMessages.forEach(message => {
          counts[message.conversacion_id] = (counts[message.conversacion_id] || 0) + 1;
        });
        
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error loading unread counts:', error);
      }
    };

    loadUnreadCounts();
  }, [user, conversations]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-BO');
    }
  };

  const getConversationTitle = (conversation: Conversacion) => {
    if (conversation.pedido_id) {
      return `Pedido #${conversation.pedido_id.slice(0, 8)}`;
    }

    // Para conversaciones directas, mostrar el nombre del otro participante
    if (conversation.participantes && conversation.participantes.length > 0) {
      const otherParticipant = conversation.participantes.find(
        p => p.usuario?.usuario_id !== user?.usuario_id
      );
      
      if (otherParticipant?.usuario) {
        return `${otherParticipant.usuario.nombre} ${otherParticipant.usuario.apellido}`;
      }
    }

    return 'Conversación';
  };

  const getConversationPreview = (conversation: Conversacion) => {
    // Aquí podrías implementar lógica para mostrar el último mensaje
    // Por ahora, mostramos información básica
    if (conversation.pedido_id) {
      return 'Conversación sobre pedido';
    }
    
    return 'Conversación directa';
  };

  const getConversationAvatar = (conversation: Conversacion) => {
    if (conversation.pedido_id) {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
        </div>
      );
    }

    // Avatar del otro participante
    if (conversation.participantes && conversation.participantes.length > 0) {
      const otherParticipant = conversation.participantes.find(
        p => p.usuario?.usuario_id !== user?.usuario_id
      );
      
      if (otherParticipant?.usuario) {
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {otherParticipant.usuario.nombre.charAt(0)}
            </span>
          </div>
        );
      }
    }

    return (
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <UserIcon className="w-5 h-5 text-gray-400" />
      </div>
    );
  };

  const filteredConversations = conversations.filter(conversation => {
    const title = getConversationTitle(conversation).toLowerCase();
    const preview = getConversationPreview(conversation).toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || preview.includes(search);
  });

  if (isLoading) {
    return (
      <div className="w-full bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Nueva conversación"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Buscador */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </p>
            {!searchTerm && onNewConversation && (
              <button
                onClick={onNewConversation}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Iniciar una conversación
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.conversacion_id === selectedConversationId;
              const unreadCount = unreadCounts[conversation.conversacion_id] || 0;
              
              return (
                <div
                  key={conversation.conversacion_id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-r-2 border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    {getConversationAvatar(conversation)}

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.ultimo_mensaje_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {getConversationPreview(conversation)}
                      </p>

                      {/* Indicadores de estado */}
                      <div className="flex items-center space-x-2 mt-1">
                        {conversation.estado === 'activa' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Activa
                          </span>
                        )}
                        {conversation.estado === 'archivada' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Archivada
                          </span>
                        )}
                        {conversation.pedido_id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Pedido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 