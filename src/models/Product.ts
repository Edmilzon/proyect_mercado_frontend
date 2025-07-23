import { Product as ProductType } from '@/types';

export class Product implements ProductType {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
  stock: number;

  constructor(data: ProductType) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.precio = data.precio;
    this.imagen = data.imagen;
    this.stock = data.stock;
  }

  static fromApi(data: ProductType): Product {
    return new Product({
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      imagen: data.imagen,
      stock: data.stock,
    });
  }

  getPriceAsNumber(): number {
    return parseFloat(this.precio);
  }

  isInStock(): boolean {
    return this.stock > 0;
  }

  toJSON(): ProductType {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      imagen: this.imagen,
      stock: this.stock,
    };
  }
} 