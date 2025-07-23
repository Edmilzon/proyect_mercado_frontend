export type VentaReporte = {
  id: number;
  usuario?: { nombre?: string };
  fecha: string;
  total: string;
  estado: string;
  detalles?: {
    id?: number;
    cantidad?: number;
    precio?: string;
    producto?: {
      id?: number;
      nombre?: string;
      descripcion?: string;
      precio?: string;
      imagen?: string;
      stock?: number;
    };
  }[];
}; 