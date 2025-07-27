const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dl4qmorch/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "ximena";

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: string;
  public_id?: string;
}

export class CloudinaryService {
  /**
   * Subir una imagen a Cloudinary
   */
  static async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<CloudinaryResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Agregar opciones adicionales
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    if (options.transformation) {
      formData.append('transformation', options.transformation);
    }
    if (options.public_id) {
      formData.append('public_id', options.public_id);
    }

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen a Cloudinary');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Error al subir imagen. Inténtalo de nuevo.');
    }
  }

  /**
   * Subir múltiples imágenes
   */
  static async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Eliminar imagen de Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    // Nota: Para eliminar imágenes necesitarías configurar el backend
    // ya que requiere credenciales de administrador
    console.warn('Eliminación de imágenes debe hacerse desde el backend');
  }

  /**
   * Generar URL optimizada para diferentes tamaños
   */
  static getOptimizedUrl(publicId: string, width: number = 800, height?: number): string {
    const baseUrl = `https://res.cloudinary.com/dl4qmorch/image/upload`;
    const transformation = height 
      ? `w_${width},h_${height},c_fill,q_auto,f_auto`
      : `w_${width},c_fill,q_auto,f_auto`;
    
    return `${baseUrl}/${transformation}/${publicId}`;
  }

  /**
   * Generar URL de thumbnail
   */
  static getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getOptimizedUrl(publicId, size, size);
  }

  /**
   * Validar archivo de imagen
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/webp', 
      'image/gif',
      'image/heic',
      'image/heif',
      'image/avif'
    ];

    console.log('Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      allowedTypes
    });

    // Verificar si el tipo está en la lista permitida
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      // Verificar también por extensión del archivo
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif'];
      
      if (!allowedExtensions.includes(extension || '')) {
        return {
          isValid: false,
          error: `Tipo de archivo no permitido: ${file.type}. Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF, HEIC, HEIF, AVIF)`
        };
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `El archivo ${file.name} es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 10MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Comprimir imagen antes de subir
   */
  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = URL.createObjectURL(file);
    });
  }
}

export default CloudinaryService; 