export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: string;
    imagen: string;
    stock: number;
}

export interface CartProduct {
    id: number;
    nombre: string;
    imagen: string;
    precio: number;
    cantidad: number;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}