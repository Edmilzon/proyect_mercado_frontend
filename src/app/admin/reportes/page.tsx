"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { VentaReporte } from './types';
import PDFGenerator from './PDFGenerator';

const API_BASE = "https://admi-ventas-backend.onrender.com/ventas";

const REPORTES = [
  { key: "todos", label: "Todos los pedidos", endpoint: API_BASE },
  { key: "por-dia", label: "Por día", endpoint: `${API_BASE}/por-dia` },
  { key: "por-producto", label: "Por producto", endpoint: `${API_BASE}/por-producto` },
  { key: "por-rango-fechas", label: "Por rango de fechas", endpoint: `${API_BASE}/por-rango-fechas` },
  { key: "por-estado", label: "Por estado", endpoint: `${API_BASE}/por-estado` },
];

const ReportCharts = dynamic(() => import("./ReportCharts"), { ssr: false });

type ParamFiltro = Record<string, string | number | undefined>;

// Definir tipo explícito para filas de producto en tablas
interface FilaProductoEstado {
  id: number;
  cliente: string;
  fecha: string;
  cantidad: number;
  total: number;
  estado: string;
}

export default function AdminReportesPage() {
  const [tipo, setTipo] = useState("todos");
  const [param, setParam] = useState<ParamFiltro>({});
  const [data, setData] = useState<VentaReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productos, setProductos] = useState<{id:number, nombre:string}[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setParam({ ...param, [e.target.name]: e.target.value });
  };

  const fetchReporte = async () => {
    setLoading(true);
    setError("");
    let url = "";
    switch (tipo) {
      case "todos":
        url = API_BASE;
        break;
      case "por-dia":
        url = `${API_BASE}/por-dia?fecha=${param.fecha || ""}`;
        break;
      case "por-producto":
        url = `${API_BASE}/por-producto?productoId=${param.productoId || ""}`;
        break;
      case "por-rango-fechas":
        url = `${API_BASE}/por-rango-fechas?fechaInicio=${param.fechaInicio || ""}&fechaFin=${param.fechaFin || ""}`;
        break;
      case "por-estado":
        url = `${API_BASE}/por-estado?estado=${param.estado || ""}`;
        break;
      default:
        url = API_BASE;
    }
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch {
      setError("No se pudo obtener el reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tipo === "por-producto") {
      fetch("https://admi-ventas-backend.onrender.com/productos")
        .then(res => res.json())
        .then(data => setProductos(data))
        .catch(() => setProductos([]));
    }
  }, [tipo]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-amber-700">Reportes de Ventas</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="font-semibold">Tipo de reporte</label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={tipo}
              onChange={e => { setTipo(e.target.value); setParam({}); setData([]); }}
            >
              {REPORTES.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>
          {/* Filtros dinámicos */}
          {tipo === "por-dia" && (
            <div>
              <label className="font-semibold">Fecha</label>
              <input type="date" name="fecha" className="border rounded px-3 py-2 mt-1" onChange={handleChange} />
            </div>
          )}
          {tipo === "por-producto" && (
            <div>
              <label className="font-semibold">Producto</label>
              <select
                name="productoId"
                className="border rounded px-3 py-2 mt-1"
                onChange={handleChange}
                value={param.productoId || ""}
              >
                <option value="">Selecciona un producto</option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                ))}
              </select>
            </div>
          )}
          {tipo === "por-rango-fechas" && (
            <>
              <div>
                <label className="font-semibold">Fecha inicio</label>
                <input type="date" name="fechaInicio" className="border rounded px-3 py-2 mt-1" onChange={handleChange} />
              </div>
              <div>
                <label className="font-semibold">Fecha fin</label>
                <input type="date" name="fechaFin" className="border rounded px-3 py-2 mt-1" onChange={handleChange} />
              </div>
            </>
          )}
          {tipo === "por-estado" && (
            <div>
              <label className="font-semibold">Estado</label>
              <select name="estado" className="border rounded px-3 py-2 mt-1" onChange={handleChange} value={param.estado || ""}>
                <option value="" disabled hidden>Selecciona un estado</option>
                <option value="pendiente">Pendiente</option>
                <option value="vendido">Vendido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          )}
          <button
            className="bg-amber-700 text-white px-6 py-2 rounded font-bold hover:bg-amber-800 transition min-w-[120px]"
            onClick={fetchReporte}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Generar"}
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 font-bold mb-4">{error}</div>}
      {data.length > 0 && (
        <>
          <ReportCharts data={data} tipo={tipo} />
          <MetricasClave data={data} tipo={tipo} productoId={tipo === 'por-producto' ? String(param.productoId ?? '') : undefined} />
          <TablasPorEstado data={data} tipo={tipo} productoId={tipo === 'por-producto' ? String(param.productoId ?? '') : undefined} />
          <div className="flex justify-end mt-6">
            <PDFGenerator data={data} tipo={tipo} />
          </div>
        </>
      )}
      {data.length === 0 && !loading && !error && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 text-center text-gray-500 font-semibold">Sin actividad en el rango de fechas seleccionado</div>
      )}
    </div>
  );
}

function MetricasClave({ data, tipo, productoId }: { data: VentaReporte[], tipo: string, productoId?: string }) {
  if (tipo === 'por-producto' && productoId) {
    // Filtrar detalles por productoId
    let vendidos = 0, cancelados = 0, pendientes = 0;
    let totalVendidos = 0, totalCancelados = 0, totalPendientes = 0;
    let volumenTotal = 0, valorTotalVentas = 0;
    data.forEach(v => {
      v.detalles?.forEach(det => {
        if (det.producto && String(det.producto.id) === String(productoId)) {
          const cantidad = det.cantidad ?? 0;
          const precio = parseFloat(det.precio ?? '0');
          volumenTotal += cantidad;
          valorTotalVentas += precio * cantidad;
          if (v.estado === 'vendido') {
            vendidos += cantidad;
            totalVendidos += precio * cantidad;
          } else if (v.estado === 'cancelado') {
            cancelados += cantidad;
            totalCancelados += precio * cantidad;
          } else if (v.estado === 'pendiente') {
            pendientes += cantidad;
            totalPendientes += precio * cantidad;
          }
        }
      });
    });
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 border border-amber-200 max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-amber-700 mb-4 text-center">MÉTRICAS CLAVE</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Unidades totales vendidas:</span>
            <span className="text-lg font-bold">{volumenTotal}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Valor monetario total:</span>
            <span className="text-lg font-bold">S/ {valorTotalVentas.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Vendidos:</span>
            <span className="text-lg font-bold">{vendidos} | S/ {totalVendidos.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Cancelados:</span>
            <span className="text-lg font-bold">{cancelados} | S/ {totalCancelados.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Pendientes:</span>
            <span className="text-lg font-bold">{pendientes} | S/ {totalPendientes.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2 col-span-1 sm:col-span-2 bg-green-50 rounded-lg p-3 border border-green-300 mt-2">
            <span className="font-semibold text-green-700">Total en caja (ganancia):</span>
            <span className="text-xl font-extrabold text-green-700">S/ {totalVendidos.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  // ... existente para otros tipos ...
  const vendidos = data.filter(v => v.estado === 'vendido');
  const cancelados = data.filter(v => v.estado === 'cancelado');
  const pendientes = data.filter(v => v.estado === 'pendiente');
  const totalVendidos = vendidos.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const totalCancelados = cancelados.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const totalPendientes = pendientes.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const volumenTotal = vendidos.length + pendientes.length + cancelados.length;
  const valorTotalVentas = totalVendidos + totalPendientes + totalCancelados;
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8 border border-amber-200 max-w-2xl mx-auto">
      <h3 className="text-lg font-bold text-amber-700 mb-4 text-center">MÉTRICAS CLAVE</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700">Volumen total de pedidos:</span>
          <span className="text-lg font-bold">{volumenTotal}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700">Valor monetario total de pedidos:</span>
          <span className="text-lg font-bold">S/ {valorTotalVentas.toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700">Vendidos:</span>
          <span className="text-lg font-bold">{vendidos.length} | S/ {totalVendidos.toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700">Cancelados:</span>
          <span className="text-lg font-bold">{cancelados.length} | S/ {totalCancelados.toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700">Pendientes:</span>
          <span className="text-lg font-bold">{pendientes.length} | S/ {totalPendientes.toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-2 col-span-1 sm:col-span-2 bg-green-50 rounded-lg p-3 border border-green-300 mt-2">
          <span className="font-semibold text-green-700">Total en caja (ganancia):</span>
          <span className="text-xl font-extrabold text-green-700">S/ {totalVendidos.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function TablasPorEstado({ data, tipo, productoId }: { data: VentaReporte[], tipo: string, productoId?: string }) {
  if (tipo === 'por-producto' && productoId) {
    // Agrupar detalles por estado solo del producto seleccionado
    const vendidos: FilaProductoEstado[] = [], cancelados: FilaProductoEstado[] = [], pendientes: FilaProductoEstado[] = [];
    data.forEach(v => {
      v.detalles?.forEach(det => {
        if (det.producto && String(det.producto.id) === String(productoId)) {
          const cantidad = det.cantidad ?? 0;
          const precio = parseFloat(det.precio ?? '0');
          const row: FilaProductoEstado = {
            id: v.id,
            cliente: v.usuario?.nombre || '-',
            fecha: v.fecha,
            cantidad,
            total: precio * cantidad,
            estado: v.estado
          };
          if (v.estado === 'vendido') vendidos.push(row);
          else if (v.estado === 'cancelado') cancelados.push(row);
          else if (v.estado === 'pendiente') pendientes.push(row);
        }
      });
    });
    return (
      <div className="grid grid-cols-1 gap-8">
        <TablaEstado
          titulo="Vendidos"
          colorTitulo="text-green-700"
          datos={vendidos}
          total={vendidos.reduce((sum, v) => sum + v.total, 0)}
          cantidad={vendidos.reduce((sum, v) => sum + v.cantidad, 0)}
        />
        <TablaEstado
          titulo="Cancelados"
          colorTitulo="text-red-600"
          datos={cancelados}
          total={cancelados.reduce((sum, v) => sum + v.total, 0)}
          cantidad={cancelados.reduce((sum, v) => sum + v.cantidad, 0)}
        />
        <TablaEstado
          titulo="Pendientes"
          colorTitulo="text-amber-600"
          datos={pendientes}
          total={pendientes.reduce((sum, v) => sum + v.total, 0)}
          cantidad={pendientes.reduce((sum, v) => sum + v.cantidad, 0)}
        />
      </div>
    );
  }
  // ... existente para otros tipos ...
  const vendidos = data.filter(v => v.estado === 'vendido');
  const cancelados = data.filter(v => v.estado === 'cancelado');
  const pendientes = data.filter(v => v.estado === 'pendiente');
  return (
    <div className="grid grid-cols-1 gap-8">
      <TablaEstado
        titulo="Pedidos Vendidos"
        colorTitulo="text-green-700"
        datos={vendidos}
        total={vendidos.reduce((sum, v) => sum + parseFloat(v.total), 0)}
        cantidad={vendidos.length}
      />
      <TablaEstado
        titulo="Pedidos Cancelados"
        colorTitulo="text-red-600"
        datos={cancelados}
        total={cancelados.reduce((sum, v) => sum + parseFloat(v.total), 0)}
        cantidad={cancelados.length}
      />
      <TablaEstado
        titulo="Pedidos Pendientes"
        colorTitulo="text-amber-600"
        datos={pendientes}
        total={pendientes.reduce((sum, v) => sum + parseFloat(v.total), 0)}
        cantidad={pendientes.length}
      />
    </div>
  );
}

function TablaEstado({ titulo, colorTitulo, datos, total, cantidad }: { titulo: string, colorTitulo: string, datos: FilaProductoEstado[] | VentaReporte[], total: number, cantidad: number }) {
  if (datos.length === 0) return null;
  function isFilaProductoEstado(obj: unknown): obj is FilaProductoEstado {
    return typeof obj === 'object' && obj !== null && 'cantidad' in obj;
  }
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h4 className={`text-lg font-bold mb-2 ${colorTitulo}`}>{titulo}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-amber-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Cliente</th>
              <th className="px-4 py-2 border">Fecha</th>
              {isFilaProductoEstado(datos[0]) && <th className="px-4 py-2 border">Cantidad</th>}
              <th className="px-4 py-2 border">Total</th>
              <th className="px-4 py-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((v, i) => (
              <tr key={i}>
                <td className="px-4 py-2 border">{v.id}</td>
                <td className="px-4 py-2 border">{'cliente' in v ? v.cliente : v.usuario?.nombre || '-'}</td>
                <td className="px-4 py-2 border">{new Date(v.fecha).toLocaleString()}</td>
                {isFilaProductoEstado(v) && <td className="px-4 py-2 border">{v.cantidad}</td>}
                <td className="px-4 py-2 border">S/ {typeof v.total === 'number' ? v.total.toFixed(2) : Number(v.total).toFixed(2)}</td>
                <td className="px-4 py-2 border">{'estado' in v ? v.estado : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td colSpan={isFilaProductoEstado(datos[0]) ? 3 : 2} className="border text-right">Total:</td>
              {isFilaProductoEstado(datos[0]) && <td className="border">{cantidad}</td>}
              <td className="border">S/ {total.toFixed(2)}</td>
              <td className="border"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
} 