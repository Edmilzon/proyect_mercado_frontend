'use client';

import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { 
  PhotoIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CloudinaryService, { CloudinaryResponse } from '@/services/cloudinary';

interface ImageUploadProps {
  onUpload: (response: CloudinaryResponse) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // en MB
  showPreview?: boolean;
  aspectRatio?: number; // para recorte
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onError,
  multiple = false,
  maxFiles = 5,
  folder = 'tienda',
  className = '',
  disabled = false,
  accept = 'image/*',
  maxSize = 10,
  showPreview = true,
  aspectRatio
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validar número de archivos
    if (files.length > maxFiles) {
      const errorMsg = `Máximo ${maxFiles} archivos permitidos`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validar cada archivo
    for (const file of files) {
             const validation = CloudinaryService.validateImageFile(file);
       if (!validation.isValid) {
         setError(validation.error || 'Error de validación');
         onError?.(validation.error || 'Error de validación');
         return;
       }

      if (file.size > maxSize * 1024 * 1024) {
        const errorMsg = `El archivo ${file.name} es demasiado grande. Máximo ${maxSize}MB`;
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Crear previews
      if (showPreview) {
        const urls = await Promise.all(
          files.map(file => URL.createObjectURL(file))
        );
        setPreviewUrls(urls);
      }

      // Comprimir imágenes si es necesario
      const compressedFiles = await Promise.all(
        files.map(file => CloudinaryService.compressImage(file))
      );

      // Subir a Cloudinary
      const uploadPromises = compressedFiles.map(async (file, index) => {
        const response = await CloudinaryService.uploadImage(file, {
          folder: `${folder}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
        });
        
        // Simular progreso
        setUploadProgress(((index + 1) / files.length) * 100);
        
        return response;
      });

      const responses = await Promise.all(uploadPromises);

      // Llamar callback para cada imagen
      responses.forEach(response => {
        onUpload(response);
      });

      // Limpiar
      setPreviewUrls([]);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error al subir imágenes';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (disabled || isUploading) return;

    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    // Simular selección de archivos
    const dataTransfer = new DataTransfer();
    imageFiles.forEach(file => dataTransfer.items.add(file));
    
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      await handleFileSelect({ target: { files: dataTransfer.files } } as any);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : isUploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="space-y-2">
          {isUploading ? (
            <>
              <CloudArrowUpIcon className="w-8 h-8 text-blue-600 mx-auto animate-pulse" />
              <p className="text-sm text-blue-600 font-medium">
                Subiendo imágenes...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {Math.round(uploadProgress)}% completado
              </p>
            </>
          ) : (
            <>
              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {multiple ? 'Arrastra imágenes aquí o haz clic' : 'Arrastra una imagen aquí o haz clic'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {multiple ? `Máximo ${maxFiles} archivos` : 'Un archivo'} • Máximo {maxSize}MB cada uno
                </p>
                <p className="text-xs text-gray-500">
                  Formatos: JPEG, PNG, WebP, GIF
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Previews */}
      {showPreview && previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón manual */}
      {!isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full"
        >
          <PhotoIcon className="w-4 h-4 mr-2" />
          Seleccionar {multiple ? 'Imágenes' : 'Imagen'}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload; 