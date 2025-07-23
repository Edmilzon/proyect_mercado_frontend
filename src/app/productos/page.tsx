"use client";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/feature/ProductList/ProductList";
import { useProducts } from "@/hooks/useProducts";
import Spinner from "@/components/ui/Spinner/Spinner";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProductsPage() {
  const { products, loading, error } = useProducts();
  const { add, remove, getItemCount, clear, products: cartProducts } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Obtener la cantidad actual de un producto en el carrito
  const getQuantity = (productId: number): number => {
    const item = cartProducts.find((i) => i.id === productId);
    return item ? item.cantidad : 0;
  };

  // Sumar uno al producto
  const handleIncrement = (product: Product) => {
    const current = getQuantity(product.id);
    if (product.stock !== undefined && current >= product.stock) return;
    add({
      id: product.id,
      nombre: product.nombre,
      imagen: product.imagen,
      precio: parseFloat(product.precio),
      cantidad: 1,
    });
  };

  // Restar uno al producto
  const handleDecrement = (product: Product) => {
    const current = getQuantity(product.id);
    if (current > 1) {
      add({
        id: product.id,
        nombre: product.nombre,
        imagen: product.imagen,
        precio: parseFloat(product.precio),
        cantidad: -1,
      });
    } else if (current === 1) {
      remove(product.id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-10 flex flex-col items-center">
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Catálogo de Mermeladas</h1>
            <p className="text-lg text-gray-600">Elige tu favorita y ajusta la cantidad</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <FaShoppingCart className="text-3xl text-amber-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                {mounted ? getItemCount() : 0}
              </span>
            </div>
            <button
              onClick={clear}
              className="ml-2 p-2 rounded-full bg-gray-200 hover:bg-red-100 text-red-600 transition-colors"
              title="Vaciar carrito"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-500">Cargando mermeladas...</span>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center py-8">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div
            className={`grid gap-6 mx-auto w-fit
              ${products.length === 1 ? 'grid-cols-1' : ''}
              ${products.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : ''}
              ${products.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
            `}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getQuantity(product.id)}
                onIncrement={() => handleIncrement(product)}
                onDecrement={() => handleDecrement(product)}
              />
            ))}
          </div>
        )}
        {/* Botón grande para realizar pedido */}
        <div className="w-full flex justify-center mt-10">
          <button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg transition-colors disabled:opacity-50"
            onClick={() => {
              if (!isAuthenticated) {
                router.push("/login");
              } else {
                router.push("/detallerpedido");
              }
            }}
            disabled={cartProducts.length === 0}
          >
            Realizar pedido
          </button>
        </div>
      </div>
    </div>
  );
} 