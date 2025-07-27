'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { reviewsService } from '@/services/reviews';
import { UpdateResenaRequest, Resena } from '@/types';
import { 
  StarIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EditReviewFormProps {
  review: Resena;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const EditReviewForm: React.FC<EditReviewFormProps> = ({
  review,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [rating, setRating] = useState(review.calificacion);
  const [comment, setComment] = useState(review.comentario || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData: UpdateResenaRequest = {
        calificacion: rating,
        comentario: comment.trim() || undefined
      };

      await reviewsService.updateReview(review.resena_id, updateData);
      
      onSuccess?.();
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Error al actualizar la reseña. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una calificación';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <PencilIcon className="w-5 h-5 mr-2 text-blue-600" />
          Editar Reseña
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación
          </label>
          <div className="space-y-2">
            <StarRating
              rating={rating}
              interactive={true}
              onRatingChange={setRating}
              size="lg"
              className="justify-center"
            />
            <p className="text-center text-sm text-gray-600">
              {getRatingText(rating)}
            </p>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este vendedor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Actualizando...
              </div>
            ) : (
              <div className="flex items-center">
                <PencilIcon className="w-4 h-4 mr-2" />
                Actualizar Reseña
              </div>
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}; 