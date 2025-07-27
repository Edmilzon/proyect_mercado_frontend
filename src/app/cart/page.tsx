'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';
import { cartService, CartItem, CartSummary } from '@/services/cart';
import { productsService } from '@/services/products';
import { zonesService } from '@/services/zones';
import { Producto, ZonaEntrega } from '@/types';
import { 
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Estados
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<{ [key: string]: Producto }>({});
  const [zones, setZones] = useState<ZonaEntrega[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadCartData();
  }, []);

  // Recalcular cuando cambien los items
  useEffect(() => {
    if (cartItems.length > 0) {
      calculateCartSummary();
    }
  }, [cartItems, selectedZone, discountCode]);

  const loadCartData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar items del carrito
      const items = cartService.getCartItems();
      setCartItems(items);

      if (items.length > 0) {
        // Cargar productos
        await loadProducts(items);
        
        // Cargar zonas de entrega
        await loadZones();
      }
      
    } catch (error) {
      console.error('Error loading cart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async (items: CartItem[]) => {
    try {
      const productIds = items.map(item => item.producto_id);
      const productsData: { [key: string]: Producto } = {};
      
      for (const productId of productIds) {
        try {
          const product = await productsService.getProductById(productId);
          productsData[productId] = product;
        } catch (error) {
          console.error(`Error loading product ${productId}:`, error);
        }
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadZones = async () => {
    try {
      const zonesData = await zonesService.getActiveZones();
      console.log('Zones loaded:', zonesData);
      
      // Asegurar que zonesData sea un array
      if (Array.isArray(zonesData)) {
        setZones(zonesData);
        if (zonesData.length > 0) {
          setSelectedZone(zonesData[0].zona_id);
        }
      } else {
        console.warn('Zones data is not an array:', zonesData);
        setZones([]);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
      setZones([]);
    }
  };

  const calculateCartSummary = async () => {
    try {
      setIsCalculating(true);
      
      const summary = await cartService.getCompleteSummary({
        items: cartItems,
        zona_id: selectedZone,
        codigo_descuento: discountCode
      });
      
      setCartSummary(summary);
    } catch (error) {
      console.error('Error calculating cart summary:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      cartService.updateQuantity(productId, newQuantity);
      setCartItems(cartService.getCartItems());
    }
  };

  const removeItem = (productId: string) => {
    cartService.removeFromCart(productId);
    setCartItems(cartService.getCartItems());
  };

  const clearCart = () => {
    cartService.clearCart();
    setCartItems([]);
    setCartSummary(null);
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

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // TODO: Implementar checkout
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando carrito...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar a comprar</p>
              <Button onClick={() => router.push('/products')}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Continuar comprando
              </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
            <p className="text-gray-600 mt-2">
              {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Productos</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      Limpiar carrito
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const product = products[item.producto_id];
                    if (!product) return null;

                    return (
                      <div key={item.producto_id} className="p-6">
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-20 h-20">
                            {product.url_imagen_principal && isValidImageUrl(product.url_imagen_principal) ? (
                              <Image
                                src={product.url_imagen_principal}
                                alt={product.nombre}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {product.nombre}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {product.categoria?.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              Stock: {product.cantidad_stock}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.producto_id, item.cantidad - 1)}
                              className="p-1 rounded-md hover:bg-gray-100"
                              disabled={item.cantidad <= 1}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.producto_id, item.cantidad + 1)}
                              className="p-1 rounded-md hover:bg-gray-100"
                              disabled={item.cantidad >= product.cantidad_stock}
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(product.precio_actual * item.cantidad)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(product.precio_actual)} c/u
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.producto_id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del pedido</h2>

                {/* Shipping Zone */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona de entrega
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar zona de entrega</option>
                    {Array.isArray(zones) && zones.length > 0 ? (
                      zones.map((zone) => (
                        <option key={zone.zona_id} value={zone.zona_id}>
                          {zone.nombre} - {formatPrice(zone.tarifa_envio)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay zonas disponibles
                      </option>
                    )}
                  </select>
                </div>

                {/* Discount Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de descuento
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Código de descuento"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscountCode('')}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                {isCalculating ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Calculando...</p>
                  </div>
                ) : cartSummary ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSummary.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span>{formatPrice(cartSummary.costo_envio)}</span>
                    </div>
                    
                    {cartSummary.monto_descuento > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span>-{formatPrice(cartSummary.monto_descuento)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(cartSummary.monto_final)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={!cartSummary || isCalculating}
                  className="w-full mt-6 bg-black text-white hover:bg-gray-800 py-3"
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Proceder al pago
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="w-full mt-3"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Continuar comprando
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 