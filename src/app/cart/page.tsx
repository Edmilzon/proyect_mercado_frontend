'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import { cartService, CartItem } from '@/services/cart';
import { productsService } from '@/services/products';
import { ordersService } from '@/services/orders';
import { Producto } from '@/types';
import { 
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { CartCompleteSummaryResponse, CartStockValidationResponse } from '@/services/cart';

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Estados simples
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<{ [key: string]: Producto }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // Estados para APIs del carrito
  const [cartSummary, setCartSummary] = useState<CartCompleteSummaryResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [stockValidation, setStockValidation] = useState<CartStockValidationResponse | null>(null);

  // Cargar items del carrito al montar
  useEffect(() => {
    const items = cartService.getCartItems();
    setCartItems(items);
    
    // Cargar datos de productos si hay items
    if (items.length > 0) {
      loadProducts(items);
      // Validar stock y calcular resumen
      validateStock();
      calculateCompleteSummary();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Recalcular cuando cambien los items del carrito
  useEffect(() => {
    if (cartItems.length > 0) {
      validateStock();
      calculateCompleteSummary();
    }
  }, [cartItems]);

  // Función para cargar productos
  const loadProducts = async (items: CartItem[]) => {
    try {
      const productsData: { [key: string]: Producto } = {};
      
      for (const item of items) {
        try {
          const product = await productsService.getProductById(item.producto_id);
          productsData[item.producto_id] = product;
        } catch (error) {
          console.error(`Error loading product ${item.producto_id}:`, error);
          // Continuar con otros productos si uno falla
        }
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones simples
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
  };

  const formatPrice = (price: number) => {
    if (isNaN(price) || !isFinite(price)) {
      return 'Bs. 0.00';
    }
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const product = products[item.producto_id];
      const price = product?.precio_actual || 0;
      return sum + (price * item.cantidad);
    }, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  // Función para crear pedido
  const handleCreateOrder = async () => {
    if (!user) {
      setOrderError('Debes iniciar sesión para realizar un pedido');
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('El carrito está vacío');
      return;
    }

    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      // Obtener el primer producto para determinar el vendedor
      const firstProduct = products[cartItems[0].producto_id];
      if (!firstProduct?.vendedor?.vendedor_id) {
        throw new Error('No se pudo determinar el vendedor');
      }

      // Crear el pedido
      const orderData = {
        comprador_id: user.usuario_id,
        vendedor_id: firstProduct.vendedor.vendedor_id,
        direccion_entrega_id: 'default', // TODO: Implementar selección de dirección
        costo_envio: shipping,
        monto_descuento: 0, // TODO: Implementar descuentos
        notas_comprador: 'Pedido desde el carrito',
        items: cartItems.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad
        }))
      };

      const order = await ordersService.createOrder(orderData);
      
      // Limpiar carrito después de crear el pedido
      cartService.clearCart();
      setCartItems([]);
      
      // Redirigir a la página de pedidos o mostrar confirmación
      router.push('/buyer/orders');
      
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError('Error al crear el pedido. Inténtalo de nuevo.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Función para validar stock
  const validateStock = async () => {
    if (cartItems.length === 0) return;
    
    try {
      const validation = await cartService.validateStock({ items: cartItems });
      setStockValidation(validation);
      
      if (!validation.items_validos) {
        setOrderError(`Algunos productos no tienen stock suficiente: ${validation.mensaje}`);
      }
    } catch (error) {
      console.error('Error validating stock:', error);
      setOrderError('Error al validar el stock de los productos');
    }
  };

  // Función para calcular resumen completo del carrito
  const calculateCompleteSummary = async () => {
    if (cartItems.length === 0) return;
    
    setIsCalculating(true);
    try {
      const summary = await cartService.getCompleteSummary({
        items: cartItems,
        zona_id: selectedZone || undefined,
        codigo_descuento: discountCode || undefined
      });
      setCartSummary(summary);
    } catch (error) {
      console.error('Error calculating cart summary:', error);
      setOrderError('Error al calcular el resumen del carrito');
    } finally {
      setIsCalculating(false);
    }
  };

  // Función para aplicar código de descuento
  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    try {
      const subtotal = calculateSubtotal();
      const discount = await cartService.calculateDiscount(subtotal, discountCode);
      
      if (discount.codigo_valido) {
        // Recalcular resumen con descuento
        await calculateCompleteSummary();
      } else {
        setOrderError('Código de descuento inválido');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      setOrderError('Error al aplicar el código de descuento');
    }
  };

  // Loading state
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

  // Carrito vacío
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

  const subtotal = calculateSubtotal();
  const shipping = 5; // Envío fijo por ahora
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
            <p className="text-gray-600 mt-2">
              Revisa tus productos antes de proceder al pago
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Productos ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const product = products[item.producto_id];
                    
                    return (
                      <div key={item.producto_id} className="p-6">
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {product?.url_imagen_principal ? (
                              <Image
                                src={product.url_imagen_principal}
                                alt={product.nombre}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">IMG</span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {product?.nombre || `Producto #${item.producto_id.slice(-8)}`}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {product?.categoria?.nombre || 'Sin categoría'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Cantidad: {item.cantidad}
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
                              disabled={product && item.cantidad >= product.cantidad_stock}
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice((product?.precio_actual || 0) * item.cantidad)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(product?.precio_actual || 0)} c/u
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

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {orderError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-red-600 text-sm">{orderError}</p>
                  </div>
                )}

                {/* Create Order Button */}
                <Button
                  onClick={handleCreateOrder}
                  className="w-full mt-6 bg-black text-white hover:bg-gray-800 py-3"
                  disabled={cartItems.length === 0 || isCreatingOrder}
                >
                  {isCreatingOrder ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creando Pedido...
                    </div>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      Realizar Pedido
                    </>
                  )}
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

                {/* Clear Cart */}
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full mt-3 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Vaciar carrito
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 