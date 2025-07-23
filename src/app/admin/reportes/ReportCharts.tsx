"use client";
import React from "react";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Legend as BarLegend,
  LineChart, Line, ResponsiveContainer
} from "recharts";
import { VentaReporte } from './types';

const COLORS = {
  pendiente: "#F59E0B", // Naranja agradable
  vendido: "#10B981",   // Verde que combina
  cancelado: "#EF4444"  // Rojo que combina
};

interface PieData { name: string; value: number; }
interface LineData { fecha: string; total: number; }

interface ReportChartsProps {
  data: VentaReporte[];
  tipo: string;
}

export default function ReportCharts({ data, tipo }: ReportChartsProps) {
  if (!data || data.length === 0) return null;

  // Pie: Distribución por estado o producto
  let pieData: PieData[] = [];
  if (tipo === "por-estado" || tipo === "todos" || tipo === "por-dia" || tipo === "por-rango-fechas") {
    const counts: Record<string, number> = {};
    data.forEach((v) => {
      counts[v.estado] = (counts[v.estado] || 0) + 1;
    });
    pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));
  } else if (tipo === "por-producto") {
    const counts: Record<string, number> = {};
    data.forEach((v) => {
      const nombre = v.detalles?.[0]?.producto?.nombre || "Producto";
      counts[nombre] = (counts[nombre] || 0) + 1;
    });
    pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  // Barras apiladas: Estados por fecha o producto
  let barData: Array<{
    fecha?: string;
    nombre?: string;
    estado?: string;
    vendido?: number;
    cancelado?: number;
    pendiente?: number;
    cantidad?: number;
  }> = [];
  if (tipo === "por-dia") {
    // Sumar totales de cada estado para ese día
    const totales = { vendido: 0, cancelado: 0, pendiente: 0 };
    data.forEach((v) => {
      totales[v.estado as keyof typeof totales]++;
    });
    barData = [{
      fecha: data[0] ? new Date(data[0].fecha).toLocaleDateString() : '',
      vendido: totales.vendido,
      cancelado: totales.cancelado,
      pendiente: totales.pendiente
    }];
  } else if (tipo === "por-semana" || tipo === "por-semanas-del-mes" || tipo === "por-rango-fechas") {
    const groupedData: Record<string, { vendido: number; cancelado: number; pendiente: number }> = {};
    data.forEach((v) => {
      const fecha = new Date(v.fecha).toLocaleDateString();
      if (!groupedData[fecha]) {
        groupedData[fecha] = { vendido: 0, cancelado: 0, pendiente: 0 };
      }
      groupedData[fecha][v.estado as keyof typeof groupedData[string]]++;
    });
    barData = Object.entries(groupedData).map(([fecha, estados]) => ({
      fecha,
      vendido: estados.vendido,
      cancelado: estados.cancelado,
      pendiente: estados.pendiente
    }));
  } else if (tipo === "por-producto") {
    const groupedData: Record<string, { vendido: number; cancelado: number; pendiente: number }> = {};
    data.forEach((v) => {
      const nombre = v.detalles?.[0]?.producto?.nombre || "Producto";
      if (!groupedData[nombre]) {
        groupedData[nombre] = { vendido: 0, cancelado: 0, pendiente: 0 };
      }
      groupedData[nombre][v.estado as keyof typeof groupedData[string]]++;
    });
    barData = Object.entries(groupedData).map(([nombre, estados]) => ({
      nombre,
      vendido: estados.vendido,
      cancelado: estados.cancelado,
      pendiente: estados.pendiente
    }));
  } else {
    // Para otros tipos, mostrar distribución por estado
    const counts: Record<string, number> = {};
    data.forEach((v) => {
      counts[v.estado] = (counts[v.estado] || 0) + 1;
    });
    barData = Object.entries(counts).map(([estado, cantidad]) => ({
      estado,
      cantidad
    }));
  }

  console.log('Area data:', barData);
  console.log('Tipo:', tipo);
  console.log('Data original:', data);

  // Línea: Fecha vs Total
  let lineData: LineData[] = [];
  if (data[0]?.fecha && data[0]?.total) {
    lineData = data.map((v) => ({
      fecha: new Date(v.fecha).toLocaleDateString(),
      total: parseFloat(v.total),
    }));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
      {/* Pie Chart */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <h3 className="font-bold text-amber-700 mb-2">Distribución (Pastel)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {pieData.map((entry, idx) => {
                const color = COLORS[entry.name as keyof typeof COLORS] || "#6B7280";
                return <Cell key={`cell-${idx}`} fill={color} />;
              })}
            </Pie>
            <PieTooltip />
            <PieLegend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <h3 className="font-bold text-amber-700 mb-2">Cantidad por Estado</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={barData[0]?.fecha ? "fecha" : barData[0]?.nombre ? "nombre" : "estado"} />
              <YAxis allowDecimals={false} />
              {barData[0]?.vendido !== undefined ? (
                <>
                  <Bar dataKey="vendido" stackId="a" fill={COLORS.vendido} name="Vendido" />
                  <Bar dataKey="cancelado" stackId="a" fill={COLORS.cancelado} name="Cancelado" />
                  <Bar dataKey="pendiente" stackId="a" fill={COLORS.pendiente} name="Pendiente" />
                </>
              ) : (
                <>
                  <Bar dataKey="cantidad" fill="#F59E42" />
                </>
              )}
              <BarTooltip />
              <BarLegend />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 text-center">No hay datos para mostrar</div>
        )}
      </div>
      {/* Line Chart */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <h3 className="font-bold text-amber-700 mb-2">Total de Ventas (Línea)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Line type="monotone" dataKey="total" stroke="#60A5FA" strokeWidth={3} dot={{ r: 4 }} />
            <BarTooltip />
            <BarLegend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 