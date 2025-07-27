'use client';

import React, { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { reviewsService } from '@/services/reviews';
import { Resena, ResponderResenaRequest } from '@/types';
import { EditReviewForm } from './EditReviewForm';
import { 
  UserIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ReviewCardProps {
  review: Resena;
  currentUserId?: string;
  onUpdate?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onUpdate,
  onDelete,
  className = ''
}) => {
  const [isResponding, setIsResponding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [response, setResponse] = useState(review.respuesta_vendedor || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSeller = currentUserId === review.vendedor_id;
  const isBuyer = currentUserId === review.comprador_id;
  const canRespond = isSeller && !review.respuesta_vendedor;
  const canEdit = isBuyer;
  const canDelete = isBuyer || currentUserId === review.vendedor_id;

  const handleRespond = async () => {
    if (!response.trim()) {
      setError('Por favor escribe una respuesta');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const responseData: ResponderResenaRequest = {
        respuesta_vendedor: response.trim()
      };

      await reviewsService.respondToReview(review.resena_id, responseData);
      setIsResponding(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error responding to review:', error);
      setError('Error al enviar la respuesta. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      await reviewsService.deleteReview(review.resena_id);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña. Inténtalo de nuevo.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {review.comprador?.nombre} {review.comprador?.apellido}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(review.fecha_resena)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {canRespond && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResponding(true)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
              Responder
            </Button>
          )}
          
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-gray-600 border-gray-600 hover:bg-gray-50"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating
          rating={review.calificacion}
          size="md"
          showValue={true}
        />
      </div>

      {/* Comment */}
      {review.comentario && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {review.comentario}
          </p>
        </div>
      )}

      {/* Seller Response */}
      {review.respuesta_vendedor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-1">
                Respuesta del vendedor
              </p>
              <p className="text-blue-800 leading-relaxed">
                {review.respuesta_vendedor}
              </p>
              {review.fecha_respuesta && (
                <p className="text-xs text-blue-600 mt-2">
                  {formatDate(review.fecha_respuesta)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Form */}
      {isResponding && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">
            Responder a la reseña
          </h4>
          
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            rows={3}
            maxLength={500}
          />
          
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleRespond}
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Enviar Respuesta
                </div>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setIsResponding(false);
                setResponse(review.respuesta_vendedor || '');
                setError(null);
              }}
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <EditReviewForm
              review={review}
              onSuccess={() => {
                setIsEditing(false);
                onUpdate?.();
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 