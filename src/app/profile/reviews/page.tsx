'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { reviewsService } from '@/services/reviews';
import { CreateReviewForm } from '@/components/reviews/CreateReviewForm';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import Navbar from '@/components/layout/Navbar';
import { Resena } from '@/types';
import { 
  ArrowLeftIcon,
  StarIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function UserReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [myReviews, setMyReviews] = useState<Resena[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Cargar reseñas y pedidos pendientes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar reseñas del usuario y pedidos pendientes
      const [reviewsData, pendingData] = await Promise.all([
        reviewsService.getBuyerReviews(user!.usuario_id),
        reviewsService.getPendingReviews(user!.usuario_id)
      ]);
      
      setMyReviews(reviewsData);
      setPendingOrders(pendingData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Error al cargar las reseñas');
      setMyReviews([]);
      setPendingOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewCreated = () => {
    setShowCreateForm(false);
    setSelectedOrder(null);
    loadData(); // Recargar datos
  };

  const handleReviewUpdate = () => {
    loadData(); // Recargar datos
  };

  const handleReviewDelete = () => {
    loadData(); // Recargar datos
  };

  const handleCreateReview = (order: any) => {
    setSelectedOrder(order);
    setShowCreateForm(true);
  };

  if (!isAuthenticated) {
    return null; // Ya se está redirigiendo
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando reseñas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/profile')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Mis Reseñas</h1>
            </div>
            <p className="text-gray-600">
              Gestiona tus reseñas y califica a los vendedores
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Pending Reviews Section */}
          {pendingOrders.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="w-6 h-6 text-yellow-400 mr-2" />
                  Pedidos Pendientes de Reseña ({pendingOrders.length})
                </h2>
                
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.pedido_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                #{order.pedido_id?.slice(0, 8) || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Pedido #{order.pedido_id?.slice(0, 8) || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Vendedor: {order.vendedor?.nombre || 'N/A'} {order.vendedor?.apellido || ''}
                              </p>
                              <p className="text-sm text-gray-600">
                                Entregado: {order.hora_real_entrega ? new Date(order.hora_real_entrega).toLocaleDateString('es-BO') : 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Total: ${order.monto_final || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCreateReview(order)}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Crear Reseña
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Reviews Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ChatBubbleLeftIcon className="w-6 h-6 mr-2" />
                Mis Reseñas ({myReviews.length})
              </h2>
              
              {myReviews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Calificación promedio:</span>
                  <StarRating
                    rating={myReviews.length > 0 ? Math.round(myReviews.reduce((sum, r) => sum + r.calificacion, 0) / myReviews.length) : 0}
                    size="sm"
                    showValue={true}
                  />
                </div>
              )}
            </div>

            {myReviews.length > 0 ? (
              <div className="space-y-6">
                {myReviews.map((review) => (
                  <ReviewCard
                    key={review.resena_id}
                    review={review}
                    currentUserId={user!.usuario_id}
                    onUpdate={handleReviewUpdate}
                    onDelete={handleReviewDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {pendingOrders.length > 0 
                    ? 'No has creado reseñas aún. ¡Califica a los vendedores de tus pedidos entregados!'
                    : 'No tienes reseñas aún'
                  }
                </p>
                {pendingOrders.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Las reseñas aparecerán aquí cuando califiques a los vendedores
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Create Review Modal */}
          {showCreateForm && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <CreateReviewForm
                  pedidoId={selectedOrder.pedido_id}
                  compradorId={user!.usuario_id}
                  vendedorId={selectedOrder.vendedor_id}
                  onSuccess={handleReviewCreated}
                  onCancel={() => {
                    setShowCreateForm(false);
                    setSelectedOrder(null);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 