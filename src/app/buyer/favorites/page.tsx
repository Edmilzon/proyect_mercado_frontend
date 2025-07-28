'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService } from '@/services/buyer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { 
  HeartIcon,
  TrashIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface FavoriteProduct {
  producto_id: string;
  nombre: string;
  descripcion?: string;
  precio_actual: number;
  url_imagen_principal?: string;
  vendedor?: {
    nombre: string;
    apellido: string;
  };
  calificacion_promedio?: number;
}

export default function BuyerFavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.rol === 'comprador') {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await buyerService.getFavorites(user!.usuario_id);
      setFavorites(response.favoritos || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Error al cargar los favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    try {
      await buyerService.removeFromFavorites(user!.usuario_id, productId);
      setFavorites(prev => prev.filter(fav => fav.producto_id !== productId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Error al eliminar de favoritos');
    }
  };

  const addToCart = async (productId: string) => {
    // TODO: Implementar agregar al carrito
    alert('Función de agregar al carrito próximamente');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando favoritos...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
            <p className="text-gray-600 mt-2">
              Productos que te han gustado
            </p>
          </div>

          {/* Lista de Favoritos */}
          <div className="space-y-6">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes favoritos</h3>
                <p className="text-gray-600 mb-4">
                  Aún no has agregado productos a tus favoritos.
                </p>
                <Button
                  onClick={() => window.location.href = '/products'}
                  className="bg-blue-600 text-white"
                >
                  Explorar Productos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((product) => (
                  <div key={product.producto_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Imagen del producto */}
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {product.url_imagen_principal ? (
                        <Image
                          src={product.url_imagen_principal}
                          alt={product.nombre}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.nombre}
                      </h3>
                      
                      {product.descripcion && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.descripcion}
                        </p>
                      )}

                      {/* Vendedor */}
                      {product.vendedor && (
                        <p className="text-sm text-gray-500 mb-2">
                          Vendedor: {product.vendedor.nombre} {product.vendedor.apellido}
                        </p>
                      )}

                      {/* Calificación */}
                      {product.calificacion_promedio && (
                        <div className="flex items-center mb-3">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.calificacion_promedio.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Precio */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-gray-900">
                          Bs. {product.precio_actual.toFixed(2)}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => addToCart(product.producto_id)}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-2" />
                          Agregar al Carrito
                        </Button>
                        
                        <Button
                          onClick={() => removeFromFavorites(product.producto_id)}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 