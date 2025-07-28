'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sellerService } from '@/services/seller';
import { StarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Review {
  resena_id: string;
  pedido_id: string;
  comprador_id: string;
  vendedor_id: string;
  calificacion: number;
  comentario?: string;
  fecha_resena: string;
  respuesta_vendedor?: string;
  fecha_respuesta?: string;
  comprador?: {
    nombre: string;
    apellido: string;
    email: string;
  };
  pedido?: {
    pedido_id: string;
    fecha_pedido: string;
  };
}

export default function SellerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    if (user && user.rol === 'vendedor') {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const reviewsData = await sellerService.getSellerReviews(user!.usuario_id);
      console.log('🔍 Reviews data:', reviewsData);
      console.log('🔍 Is array:', Array.isArray(reviewsData));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Error al cargar las reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  const respondToReview = async (reviewId: string) => {
    if (!responseText.trim()) {
      setError('Debes escribir una respuesta');
      return;
    }

    try {
      setIsResponding(true);
      await sellerService.respondToReview(reviewId, responseText);
      setResponseText('');
      setSelectedReview(null);
      await loadReviews(); // Recargar reseñas
    } catch (error) {
      console.error('Error responding to review:', error);
      setError('Error al responder a la reseña');
    } finally {
      setIsResponding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const getAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return '0.0';
    const total = reviews.reduce((sum, review) => sum + review.calificacion, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadReviews}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los vendedores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reseñas de Clientes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las reseñas y comentarios de tus clientes
          </p>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{Array.isArray(reviews) ? reviews.length : 0}</div>
              <div className="text-sm text-gray-600">Total de Reseñas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{getAverageRating()}</div>
              <div className="text-sm text-gray-600">Calificación Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {Array.isArray(reviews) ? reviews.filter(r => !r.respuesta_vendedor).length : 0}
              </div>
              <div className="text-sm text-gray-600">Sin Responder</div>
            </div>
          </div>
        </div>

        {/* Lista de Reseñas */}
        <div className="space-y-6">
          {!Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">⭐</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reseñas</h3>
              <p className="text-gray-600">
                Aún no has recibido reseñas de tus clientes.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.resena_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {review.comprador?.nombre?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.comprador?.nombre} {review.comprador?.apellido}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(review.fecha_resena)}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.calificacion)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Pedido #{review.pedido_id?.slice(0, 8) || 'N/A'}
                  </div>
                </div>

                {/* Comentario del Cliente */}
                {review.comentario && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Comentario</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {review.comentario}
                    </p>
                  </div>
                )}

                {/* Respuesta del Vendedor */}
                {review.respuesta_vendedor && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tu Respuesta</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded">
                      {review.respuesta_vendedor}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Respondido el {review.fecha_respuesta && formatDate(review.fecha_respuesta)}
                    </p>
                  </div>
                )}

                {/* Botón para Responder */}
                {!review.respuesta_vendedor && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                      Responder
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal de Respuesta */}
        {selectedReview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Responder a la reseña
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Reseña de {selectedReview.comprador?.nombre} {selectedReview.comprador?.apellido}:
                  </p>
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    {renderStars(selectedReview.calificacion)}
                    {selectedReview.comentario && (
                      <p className="text-gray-700 mt-2">{selectedReview.comentario}</p>
                    )}
                  </div>
                </div>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setSelectedReview(null);
                      setResponseText('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => respondToReview(selectedReview.resena_id)}
                    disabled={isResponding || !responseText.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isResponding ? 'Enviando...' : 'Enviar Respuesta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 