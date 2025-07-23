"use client";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts } from "@/lib/api/services/products";
import { LoadingState } from "@/types/common";

export const useProducts = (): LoadingState & { products: Product[] } => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setError("No se pudo cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { products, loading, error };
};
