import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartProduct } from '@/types/product';
import { APP_CONSTANTS } from '@/config';

interface CartState {
  products: CartProduct[];
  add: (product: CartProduct) => void;
  remove: (id: number) => void;
  clear: () => void;
  updateQuantity: (id: number, quantity: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      products: [],

      add: (newProduct) => {
        const products = get().products;
        const existing = products.find(p => p.id === newProduct.id);

        if (existing) {
          set({
            products: products.map(p =>
              p.id === newProduct.id
                ? { ...p, cantidad: p.cantidad + newProduct.cantidad }
                : p
            )
          });
        } else {
          set({ products: [...products, newProduct] });
        }
      },

      remove: (id) => {
        set({
          products: get().products.filter(p => p.id !== id)
        });
      },

      clear: () => {
        set({ products: [] });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          products: get().products.map(p =>
            p.id === id ? { ...p, cantidad: quantity } : p
          )
        });
      },

      getTotal: () => {
        return get().products.reduce(
          (sum, p) => sum + p.precio * p.cantidad,
          0
        );
      },

      getItemCount: () => {
        return get().products.reduce(
          (sum, p) => sum + p.cantidad,
          0
        );
      }
    }),
    {
      name: APP_CONSTANTS.CART_STORAGE_KEY,
    }
  )
);
