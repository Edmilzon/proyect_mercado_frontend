'use client';

import React from 'react';
import { Mensaje } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckIcon,
  CheckDoubleIcon,
  TrashIcon,
  PhotoIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Mensaje;
  onDelete?: (messageId: string) => void;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onDelete,
  showTimestamp = true
}) => {
  const { user } = useAuth();
  const isOwnMessage = message.remitente_id === user?.usuario_id;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-BO');
    }
  };

  const renderMessageContent = () => {
    switch (message.tipo_mensaje) {
      case 'texto':
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.contenido}
          </p>
        );
      
      case 'imagen':
        return (
          <div className="space-y-2">
            {message.contenido && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.contenido}
              </p>
            )}
            {message.url_archivo && (
              <div className="relative">
                <Image
                  src={message.url_archivo}
                  alt="Imagen del mensaje"
                  width={200}
                  height={200}
                  className="rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.url_archivo, '_blank')}
                />
              </div>
            )}
          </div>
        );
      
      case 'archivo':
        return (
          <div className="space-y-2">
            {message.contenido && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.contenido}
              </p>
            )}
            {message.url_archivo && (
              <a
                href={message.url_archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <DocumentIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  Descargar archivo
                </span>
              </a>
            )}
          </div>
        );
      
      case 'sistema':
        return (
          <div className="text-center">
            <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {message.contenido}
            </p>
          </div>
        );
      
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.contenido}
          </p>
        );
    }
  };

  if (message.tipo_mensaje === 'sistema') {
    return (
      <div className="flex justify-center my-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {message.contenido}
          </p>
          {showTimestamp && (
            <p className="text-xs text-gray-400 mt-1">
              {formatTime(message.enviado_at)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Avatar y nombre del remitente */}
        {!isOwnMessage && message.remitente && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {message.remitente.nombre.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {message.remitente.nombre} {message.remitente.apellido}
            </span>
          </div>
        )}

        {/* Burbuja del mensaje */}
        <div
          className={`relative px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          {renderMessageContent()}

          {/* Indicadores de estado */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-1">
              {isOwnMessage && (
                <>
                  {message.es_leido ? (
                    <CheckDoubleIcon className="w-3 h-3 text-blue-300" />
                  ) : (
                    <CheckIcon className="w-3 h-3 text-gray-300" />
                  )}
                </>
              )}
            </div>

            {/* Timestamp */}
            {showTimestamp && (
              <span className={`text-xs ${
                isOwnMessage ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {formatTime(message.enviado_at)}
              </span>
            )}
          </div>

          {/* Botón de eliminar (solo para mensajes propios) */}
          {isOwnMessage && onDelete && (
            <button
              onClick={() => onDelete(message.mensaje_id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              title="Eliminar mensaje"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Fecha completa en mensajes separados por día */}
        {showTimestamp && (
          <div className={`text-center mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            <p className="text-xs text-gray-400">
              {formatDate(message.enviado_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 