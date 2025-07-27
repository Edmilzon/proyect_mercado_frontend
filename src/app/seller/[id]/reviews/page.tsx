'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { reviewsService } from '@/services/reviews';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import { Resena, CalificacionVendedor } from '@/types';
import { 
  ArrowLeftIcon,
  StarIcon,
  FunnelIcon,
  ChatBubbleLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function SellerReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sellerId = params.id as string;

  const [reviews, setReviews] = useState<Resena[]>([]);
  const [rating, setRating] = useState<CalificacionVendedor | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [filteredReviews, setFilteredReviews] = useState<Resena[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar reseñas y calificación
  useEffect(() => {
    if (sellerId) {
      loadData();
    }
  }, [sellerId]);

  // Filtrar reseñas cuando cambia el filtro
  useEffect(() => {
    if (selectedRating === null) {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => review.calificacion === selectedRating));
    }
  }, [reviews, selectedRating]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar reseñas del vendedor y calificación
      const [reviewsData, ratingData] = await Promise.all([
        reviewsService.getSellerReviews(sellerId),
        reviewsService.getSellerRating(sellerId)
      ]);
      
      setReviews(reviewsData);
      setRating(ratingData);
      
      // Extraer información del vendedor de la primera reseña
      if (reviewsData.length > 0 && reviewsData[0].vendedor) {
        setSellerInfo(reviewsData[0].vendedor);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Error al cargar las reseñas');
      setReviews([]);
      setRating(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewUpdate = () => {
    loadData(); // Recargar datos
  };

  const handleReviewDelete = () => {
    loadData(); // Recargar datos
  };

  const getRatingPercentage = (starCount: number) => {
    if (!rating || rating.total_resenas === 0) return 0;
    return Math.round((rating.distribucion[starCount as keyof typeof rating.distribucion] / rating.total_resenas) * 100);
  };

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
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Reseñas del Vendedor</h1>
            </div>
            
            {sellerInfo && (
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sellerInfo.nombre} {sellerInfo.apellido}
                  </h2>
                  <p className="text-gray-600">{sellerInfo.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="w-6 h-6 text-yellow-400 mr-2" />
                  Calificación General
                </h2>

                {rating ? (
                  <div className="space-y-4">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {rating.calificacion_promedio.toFixed(1)}
                      </div>
                      <StarRating
                        rating={Math.round(rating.calificacion_promedio)}
                        size="lg"
                        showValue={false}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        {rating.total_resenas} reseñas
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center">
                          <span className="text-sm text-gray-600 w-8">{stars}★</span>
                          <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${getRatingPercentage(stars)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">
                            {rating.distribucion[stars as keyof typeof rating.distribucion]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay calificación disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ChatBubbleLeftIcon className="w-6 h-6 mr-2" />
                    Reseñas ({filteredReviews.length})
                  </h2>

                  {/* Rating Filter */}
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedRating || ''}
                      onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas las calificaciones</option>
                      <option value="5">5 estrellas</option>
                      <option value="4">4 estrellas</option>
                      <option value="3">3 estrellas</option>
                      <option value="2">2 estrellas</option>
                      <option value="1">1 estrella</option>
                    </select>
                  </div>
                </div>

                {filteredReviews.length > 0 ? (
                  <div className="space-y-6">
                    {filteredReviews.map((review) => (
                      <ReviewCard
                        key={review.resena_id}
                        review={review}
                        currentUserId={user?.usuario_id}
                        onUpdate={handleReviewUpdate}
                        onDelete={handleReviewDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {selectedRating 
                        ? `No hay reseñas con ${selectedRating} estrella${selectedRating > 1 ? 's' : ''}`
                        : 'No hay reseñas aún'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 