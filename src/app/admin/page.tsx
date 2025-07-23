"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getPedidos, actualizarEstadoPedido } from "@/lib/api/services/pedidos";
import Spinner from "@/components/ui/Spinner/Spinner";

const TABS = [
  { key: "pendiente", label: "Pendientes" },
  { key: "vendido", label: "Vendidos" },
  { key: "cancelado", label: "Cancelados" },
];

// Definir tipo para pedido admin
interface PedidoAdmin {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    direccion: string;
    telf: string;
  };
  direccion: string;
  total: string;
  fecha: string;
  estado: string;
  detalles: {
    id: number;
    producto: {
      id: number;
      nombre: string;
      descripcion: string;
      precio: string;
      imagen: string;
      stock: number;
    };
    cantidad: number;
    precio: string;
  }[];
}

export default function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pendiente");
  const [accionando, setAccionando] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAdmin, router]);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const data = await getPedidos();
      setPedidos(data);
    } catch {
      setError("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleEstado = async (id: number, estado: string) => {
    setAccionando(id);
    try {
      await actualizarEstadoPedido(id, estado);
      await fetchPedidos();
    } catch {
      setError("No se pudo actualizar el estado");
    } finally {
      setAccionando(null);
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => p.estado === tab);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-amber-700">Panel de Administración</h1>
      <div className="flex gap-4 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-lg font-bold border-b-4 transition-all ${tab === t.key ? "border-amber-600 text-amber-700 bg-amber-50" : "border-transparent text-gray-500 bg-white hover:bg-amber-50"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40"><Spinner /></div>
      ) : error ? (
        <div className="text-red-600 font-bold text-center">{error}</div>
      ) : (
        <div className="grid gap-6">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-gray-500 text-center">No hay pedidos en esta sección.</div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center gap-4 border border-amber-100">
                <div className="flex-1">
                  <div className="font-bold text-lg text-amber-700 mb-1">Pedido #{pedido.id}</div>
                  <div className="text-gray-700 mb-1">Cliente: <span className="font-semibold">{pedido.usuario?.nombre}</span> ({pedido.usuario?.correo})</div>
                  <div className="text-gray-700 mb-1">Dirección: {pedido.direccion}</div>
                  <div className="text-gray-700 mb-1">Teléfono: {pedido.usuario?.telf}</div>
                  <div className="text-gray-700 mb-1">Fecha: {new Date(pedido.fecha).toLocaleString()}</div>
                  <div className="text-gray-700 mb-1">Total: <span className="font-bold">S/ {pedido.total}</span></div>
                  <div className="mt-2">
                    <span className="font-semibold">Productos:</span>
                    <ul className="list-disc ml-6">
                      {pedido.detalles.map((d) => (
                        <li key={d.id} className="text-gray-600">
                          {d.producto?.nombre} x {d.cantidad} (S/ {d.precio})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {tab === "pendiente" && (
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60"
                      disabled={accionando === pedido.id}
                      onClick={() => handleEstado(pedido.id, "vendido")}
                    >
                      {accionando === pedido.id ? "Procesando..." : "Confirmar Venta"}
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-60"
                      disabled={accionando === pedido.id}
                      onClick={() => handleEstado(pedido.id, "cancelado")}
                    >
                      {accionando === pedido.id ? "Procesando..." : "Cancelar"}
                    </button>
                  </div>
                )}
                {tab === "vendido" && (
                  <div className="text-green-700 font-bold">Venta confirmada</div>
                )}
                {tab === "cancelado" && (
                  <div className="text-red-600 font-bold">Pedido cancelado</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 