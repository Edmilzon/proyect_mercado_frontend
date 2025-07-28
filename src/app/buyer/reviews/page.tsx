'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService } from '@/services/buyer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { 
  StarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Review {
  resena_id: string;
  calificacion: number;
  comentario?: string;
  fecha_creacion: string;
  producto?: {
    nombre: string;
    url_imagen_principal?: string;
  };
  vendedor?: {
    nombre: string;
    apellido: string;
  };
  pedido_id: string;
}

export default function BuyerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'written' | 'pending'>('written');

  useEffect(() => {
    if (user && user.rol === 'comprador') {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar reseñas escritas
      const writtenReviews = await buyerService.getMyReviews(user!.usuario_id);
      setReviews(writtenReviews || []);

      // Cargar reseñas pendientes
      const pending = await buyerService.getPendingReviews(user!.usuario_id);
      setPendingReviews(pending || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Error al cargar las reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      await buyerService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.resena_id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'comprador') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Acceso Denegado</div>
          <p className="text-gray-600">Solo los compradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Reseñas</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las reseñas que has escrito
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('written')}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'written'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reseñas Escritas ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pendientes de Escribir ({pendingReviews.length})
              </button>
            </div>
          </div>

          {/* Contenido de las tabs */}
          {activeTab === 'written' ? (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reseñas</h3>
                  <p className="text-gray-600 mb-4">
                    Aún no has escrito ninguna reseña.
                  </p>
                  <Button
                    onClick={() => setActiveTab('pending')}
                    className="bg-blue-600 text-white"
                  >
                    Ver Pedidos Pendientes
                  </Button>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.resena_id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {review.producto?.url_imagen_principal && (
                            <img
                              src={review.producto.url_imagen_principal}
                              alt={review.producto.nombre}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {review.producto?.nombre || 'Producto'}
                            </h3>
                            {review.vendedor && (
                              <p className="text-sm text-gray-500">
                                Vendedor: {review.vendedor.nombre} {review.vendedor.apellido}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          {renderStars(review.calificacion)}
                        </div>

                        {review.comentario && (
                          <p className="text-gray-700 mb-3">
                            {review.comentario}
                          </p>
                        )}

                        <p className="text-sm text-gray-500">
                          Escrita el {formatDate(review.fecha_creacion)}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => window.location.href = `/buyer/reviews/edit/${review.resena_id}`}
                          variant="outline"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        
                        <Button
                          onClick={() => deleteReview(review.resena_id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reseñas pendientes</h3>
                  <p className="text-gray-600 mb-4">
                    Todos tus pedidos entregados ya han sido reseñados.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/buyer/orders'}
                    className="bg-blue-600 text-white"
                  >
                    Ver Mis Pedidos
                  </Button>
                </div>
              ) : (
                pendingReviews.map((pending) => (
                  <div key={pending.pedido_id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {pending.producto?.url_imagen_principal && (
                            <img
                              src={pending.producto.url_imagen_principal}
                              alt={pending.producto.nombre}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {pending.producto?.nombre || 'Producto'}
                            </h3>
                            {pending.vendedor && (
                              <p className="text-sm text-gray-500">
                                Vendedor: {pending.vendedor.nombre} {pending.vendedor.apellido}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">
                          Pedido entregado el {formatDate(pending.fecha_entrega)}
                        </p>

                        <p className="text-gray-600">
                          Escribe una reseña para ayudar a otros compradores.
                        </p>
                      </div>

                      <Button
                        onClick={() => window.location.href = `/buyer/reviews/create?pedido_id=${pending.pedido_id}`}
                        className="bg-blue-600 text-white"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Escribir Reseña
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 