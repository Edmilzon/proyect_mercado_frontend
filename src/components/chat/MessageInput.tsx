'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'texto' | 'imagen' | 'archivo', fileUrl?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Escribe un mensaje..."
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Typing indicator
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, [message, isTyping, onTyping]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping?.(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const isImage = allowedImageTypes.includes(file.type);
    const isAllowedFile = allowedFileTypes.includes(file.type);

    if (!isImage && !isAllowedFile) {
      alert('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs, documentos de Word y archivos de texto.');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    setSelectedFile(file);

    // Crear preview para imágenes
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Aquí implementarías la lógica de upload a Cloudinary o similar
    // Por ahora, simulamos el upload
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular URL de archivo subido
        resolve(`https://example.com/uploads/${file.name}`);
      }, 1000);
    });
  };

  const handleSendMessage = async () => {
    if (disabled || isUploading) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !selectedFile) return;

    setIsUploading(true);

    try {
      if (selectedFile) {
        // Subir archivo
        const fileUrl = await uploadFile(selectedFile);
        
        // Determinar tipo de mensaje
        const isImage = selectedFile.type.startsWith('image/');
        const messageType = isImage ? 'imagen' : 'archivo';
        
        // Enviar mensaje con archivo
        onSendMessage(trimmedMessage, messageType, fileUrl);
        
        // Limpiar archivo
        removeFile();
      } else {
        // Enviar mensaje de texto
        onSendMessage(trimmedMessage, 'texto');
      }

      // Limpiar mensaje
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
      
      // Resetear altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const canSend = (message.trim().length > 0 || selectedFile) && !disabled && !isUploading;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Preview de archivo seleccionado */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {filePreview ? (
                <Image
                  src={filePreview}
                  alt="Preview"
                  width={40}
                  height={40}
                  className="rounded object-cover"
                />
              ) : (
                <DocumentIcon className="w-10 h-10 text-blue-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Input de mensaje */}
      <div className="flex items-end space-x-2">
        {/* Botón de archivo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adjuntar archivo"
        >
          <DocumentIcon className="w-5 h-5" />
        </button>

        {/* Botón de imagen */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adjuntar imagen"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Textarea de mensaje */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            maxLength={1000}
          />
        </div>

        {/* Botón de enviar */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Contador de caracteres */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          {message.length}/1000 caracteres
        </p>
        {isUploading && (
          <p className="text-xs text-blue-600">
            Subiendo archivo...
          </p>
        )}
      </div>
    </div>
  );
}; 