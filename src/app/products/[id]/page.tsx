'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';
import { productsService } from '@/services/products';
import { cartService } from '@/services/cart';
import { Producto, ImagenProducto } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { 
  ArrowLeftIcon,
  StarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

export default function ProductDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // Estados
  const [product, setProduct] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Cargar producto
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      console.log('Loading product with ID:', productId);
      
      const productData = await productsService.getProductById(productId);
      console.log('Product data loaded:', productData);
      console.log('Main image URL:', productData?.url_imagen_principal);
      
      // Cargar imágenes adicionales del producto
      let additionalImages: ImagenProducto[] = [];
      try {
        console.log('Loading additional images from:', API_ENDPOINTS.PRODUCTS.IMAGES(productId));
        additionalImages = await productsService.getProductImages(productId);
        console.log('Additional images loaded:', additionalImages);
      } catch (error) {
        console.log('No additional images found or error loading them:', error);
      }
      
      // Combinar imagen principal con imágenes adicionales
      if (productData) {
        const allImages: ImagenProducto[] = [];
        
        // Agregar imagen principal si existe
        if (productData.url_imagen_principal) {
          console.log('Adding main image:', productData.url_imagen_principal);
          allImages.push({
            imagen_id: `main-${productData.producto_id}`,
            url_imagen: productData.url_imagen_principal,
            producto_id: productData.producto_id,
            orden_indice: 0,
            creado_at: ''
          });
        }
        
        // Agregar imágenes adicionales
        additionalImages.forEach((img, index) => {
          console.log('Adding additional image:', img.url_imagen);
          allImages.push({
            ...img,
            orden_indice: img.orden_indice || index + 1
          });
        });
        
        // Ordenar por orden_indice
        allImages.sort((a, b) => (a.orden_indice || 0) - (b.orden_indice || 0));
        
        // Asignar las imágenes combinadas al producto
        productData.imagenes = allImages;
        
        console.log('Final combined images:', allImages);
        console.log('Total images count:', allImages.length);
      }
      
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      cartService.addToCart(productId, quantity);
      alert('Producto agregado al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price);
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

  const getDiscountPercentage = () => {
    if (!product) return 0;
    return Math.round(((product.precio_base - product.precio_actual) / product.precio_base) * 100);
  };

  const nextImage = () => {
    if (!product?.imagenes) return;
    setSelectedImageIndex((prev) => 
      prev === product.imagenes!.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product?.imagenes) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.imagenes!.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
              <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
              <Button onClick={() => router.push('/products')}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver al catálogo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allImages = product.imagenes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
              className="text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver al catálogo
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                {allImages.length > 0 && allImages[selectedImageIndex]?.url_imagen && isValidImageUrl(allImages[selectedImageIndex].url_imagen) ? (
                  <>
                    <Image
                      src={allImages[selectedImageIndex].url_imagen}
                      alt={product.nombre}
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ShoppingCartIcon className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={`${image.imagen_id}-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      {image.url_imagen && isValidImageUrl(image.url_imagen) ? (
                        <Image
                          src={image.url_imagen}
                          alt={`${product.nombre} ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Category */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.nombre}
                </h1>
                <p className="text-gray-600 mb-4">
                  Categoría: {product.categoria?.nombre || 'Sin categoría'}
                </p>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-5 h-5 ${
                          star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">4.5 (25 reseñas)</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.precio_actual)}
                  </span>
                  {product.precio_actual < product.precio_base && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.precio_base)}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                        -{getDiscountPercentage()}%
                      </span>
                    </>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Stock and Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Stock disponible</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {product.cantidad_stock} unidades
                  </p>
                </div>
                {product.peso_g && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Peso</h4>
                    <p className="text-2xl font-bold text-gray-600">
                      {product.peso_g}g
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={product.cantidad_stock}
                      className="w-20 text-center border-0"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.cantidad_stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity >= product.cantidad_stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.cantidad_stock === 0}
                  className="w-full bg-black text-white hover:bg-gray-800 py-3"
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
                </Button>

                {product.cantidad_stock === 0 && (
                  <p className="text-red-600 text-sm text-center">
                    Producto agotado
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Características</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <TruckIcon className="w-5 h-5 mr-3 text-gray-400" />
                    Envío disponible en toda Bolivia
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400" />
                    Garantía de calidad
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                    Vendedor verificado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Información del vendedor</h3>
              {product.vendedor?.vendedor_id && (
                <Link
                  href={`/seller/${product.vendedor.vendedor_id}/reviews`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <StarIcon className="w-4 h-4 mr-2" />
                  Ver Reseñas
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Vendedor</p>
                  <p className="text-sm text-gray-600">
                    {product.vendedor?.usuario?.nombre} {product.vendedor?.usuario?.apellido}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Ubicación</p>
                  <p className="text-sm text-gray-600">Bolivia</p>
                </div>
              </div>
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Calificación</p>
                  <p className="text-sm text-gray-600">
                    {product.vendedor?.calificacion_promedio ? 
                      `${product.vendedor.calificacion_promedio}/5` : 
                      'Sin calificar'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <StarIcon className="w-6 h-6 text-yellow-400 mr-2" />
                Reseñas del vendedor
              </h3>
              <Link href={`/seller/reviews`}>
                <Button variant="outline" size="sm">
                  Ver todas las reseñas
                </Button>
              </Link>
            </div>
            
            <div className="text-center py-8">
              <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Las reseñas aparecerán aquí cuando los clientes califiquen al vendedor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 