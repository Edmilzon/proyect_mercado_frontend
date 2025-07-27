'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategorySelector } from '@/components/ui/CategorySelector';
import Navbar from '@/components/layout/Navbar';
import { productsService } from '@/services/products';
import { categoriesService } from '@/services/categories';
import { Producto, CategoriaProducto } from '@/types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estados
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('nombre') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria_id') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('precio_min') || '',
    max: searchParams.get('precio_max') || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('nombre');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
    loadProducts();
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Construir query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('nombre', searchQuery);
      if (selectedCategory) params.append('categoria_id', selectedCategory);
      if (priceRange.min) params.append('precio_min', priceRange.min);
      if (priceRange.max) params.append('precio_max', priceRange.max);
      params.append('esta_activo', 'true');
      params.append('limit', limit.toString());
      params.append('offset', ((currentPage - 1) * limit).toString());
      params.append('sort', sortBy);

      const productsData = await productsService.searchProducts(params.toString());
      
      // Debug: verificar URLs de imágenes
      if (productsData) {
        productsData.forEach(product => {
          if (product.url_imagen_principal) {
            console.log('Product image URL:', product.url_imagen_principal);
            console.log('Is valid URL:', isValidImageUrl(product.url_imagen_principal));
          }
        });
      }
      
      if (currentPage === 1) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }
      
      setHasMore(productsData.length === limit);
      setTotalProducts(prev => currentPage === 1 ? productsData.length : prev + productsData.length);
      
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('nombre');
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.categoria_id === categoryId);
    return category?.nombre || 'Sin categoría';
  };

  const isValidImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600 mt-2">
              Encuentra los mejores productos de nuestros vendedores
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <FunnelIcon className="w-4 h-4" />
                  Filtros
                </Button>
              </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <CategorySelector
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      placeholder="Todas las categorías"
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio mínimo
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio máximo
                    </label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="nombre">Nombre</option>
                      <option value="precio_actual">Precio</option>
                      <option value="creado_at">Más recientes</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    Limpiar filtros
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {totalProducts} productos encontrados
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          {isLoading && currentPage === 1 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <div
                    key={product.producto_id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => router.push(`/products/${product.producto_id}`)}
                  >
                    {/* Product Image */}
                    <div className={viewMode === 'list' ? 'w-48 h-32' : 'h-48'}>
                      {product.url_imagen_principal && isValidImageUrl(product.url_imagen_principal) ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={product.url_imagen_principal}
                            alt={product.nombre}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                          {/* Fallback placeholder */}
                          <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {product.nombre}
                        </h3>
                        {viewMode === 'list' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/products/${product.producto_id}`);
                            }}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.descripcion}
                      </p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {getCategoryName(product.categoria_id)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>4.5</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.precio_actual)}
                          </span>
                          {product.precio_actual < product.precio_base && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(product.precio_base)}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Stock: {product.cantidad_stock}
                        </div>
                      </div>

                      {viewMode === 'grid' && (
                        <Button
                          className="w-full mt-3 bg-black text-white hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products/${product.producto_id}`);
                          }}
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Ver detalles
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    className="px-8"
                  >
                    {isLoading ? 'Cargando...' : 'Cargar más productos'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 