"use client";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/helpers";
import { registrarPedido } from "@/lib/api/services/pedidos";

const WHATSAPP_NUMBER = "59176485910";

export default function DetallePedidoPage() {
  const { products, getTotal, clear } = useCartStore();
  const { user } = useAuthStore();
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stockErrorProducts, setStockErrorProducts] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleConfirmar = async () => {
    if (!user?.id || !direccion || products.length === 0) return;
    setLoading(true);
    setStockErrorProducts([]);
    try {
      // Construir payload para la API
      const payload = {
        usuarioId: user.id,
        direccion,
        detalles: products.map(p => ({
          productoId: p.id,
          cantidad: p.cantidad,
          precio: p.precio
        }))
      };
      await registrarPedido(payload);
      // Reducir stock de cada producto de forma robusta
      let stockOk = true;
      const productosSinStock: string[] = [];
      for (const p of products) {
        // Obtener stock actual desde la API
        const resGet = await fetch(`https://admi-ventas-backend.onrender.com/productos/${p.id}`);
        if (!resGet.ok) {
          stockOk = false;
          productosSinStock.push(p.nombre);
          continue;
        }
        const prodData = await resGet.json();
        const stockActual = typeof prodData.stock === 'number' ? prodData.stock : 0;
        const nuevoStock = stockActual - p.cantidad;
        if (nuevoStock < 0) {
          stockOk = false;
          productosSinStock.push(p.nombre);
          continue;
        }
        const resPatch = await fetch(`https://admi-ventas-backend.onrender.com/productos/${p.id}/stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: nuevoStock })
        });
        if (!resPatch.ok) {
          stockOk = false;
          productosSinStock.push(p.nombre);
        }
      }
      if (!stockOk) {
        setLoading(false);
        setSuccess(false);
        setStockErrorProducts(productosSinStock);
        return;
      }
      setSuccess(true);
      // Redirigir a WhatsApp
      let mensaje = `¡Hola! 👋%0A%0A`;
      mensaje += `*Solicitud de Pedido - Mermeladas Artesanales*%0A`;
      mensaje += `------------------------------------%0A`;
      mensaje += `*Datos del cliente*%0A`;
      mensaje += `Nombre: ${user.nombre || "-"}%0A`;
      mensaje += `Correo: ${user.correo || "-"}%0A`;
      mensaje += `Teléfono: ${user.telf || "-"}%0A`;
      mensaje += `Dirección de entrega: ${direccion}%0A`;
      mensaje += `------------------------------------%0A`;
      mensaje += `*Detalle del pedido*%0A`;
      mensaje += `Producto           | Cantidad | Subtotal%0A`;
      mensaje += `------------------------------------%0A`;
      products.forEach(p => {
        mensaje += `${p.nombre} | x${p.cantidad} | ${formatCurrency(p.precio * p.cantidad)}%0A`;
      });
      mensaje += `------------------------------------%0A`;
      mensaje += `*Total a pagar:* ${formatCurrency(getTotal())}%0A`;
      mensaje += `%0A`;
      mensaje += `Por favor, confirmar la recepción de este pedido. 🙏%0A`;
      mensaje += `¡Muchas gracias por su preferencia! 🍓🍑🍒`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank');
    } catch {
      setLoading(false);
      setSuccess(false);
      setStockErrorProducts(["Error al registrar el pedido. Intenta de nuevo."]);
      return;
    }
    setLoading(false);
  };

  const handleAceptar = () => {
    clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-amber-700 text-center mb-4">Detalle del Pedido</h1>
        <div>
          <h2 className="text-xl font-semibold mb-2">Productos seleccionados:</h2>
          <ul className="divide-y divide-gray-200 mb-4">
            {products.length === 0 && <li className="py-2 text-gray-500">No hay productos en el carrito.</li>}
            {products.map((p) => (
              <li key={p.id} className="flex justify-between items-center py-2">
                <span>{p.nombre} <span className="text-sm text-gray-500">x{p.cantidad}</span></span>
                <span>{formatCurrency(p.precio * p.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Datos del usuario</h2>
          <div className="mb-2">
            <span className="font-medium">Nombre:</span> {user?.nombre || "-"}
          </div>
          <div className="mb-2">
            <span className="font-medium">Correo:</span> {user?.correo || "-"}
          </div>
          <div className="mb-2">
            <span className="font-medium">Teléfono:</span> {user?.telf || "-"}
          </div>
          <div className="mb-2">
            <label className="font-medium block mb-1" htmlFor="direccion">Dirección de pedido:</label>
            <select
              id="direccion"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              disabled={loading || success}
            >
              <option value="">Selecciona una dirección...</option>
              <option value="UMSS">UMSS</option>
              <option value="plaza sucre">Plaza Sucre</option>
              <option value="plaza principal">Plaza Principal</option>
              <option value="correo">Correo</option>
              <option value="terminal">Terminal</option>
              <option value="coordinar por whatsapp">Coordinar por WhatsApp</option>
            </select>
          </div>
        </div>
        {stockErrorProducts.length > 0 && (
          <div className="mt-6 bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 max-w-xl w-full text-center mx-auto">
            <div className="font-bold mb-2">No hay suficiente stock para los siguientes productos:</div>
            <ul className="list-disc list-inside">
              {stockErrorProducts.map((nombre, idx) => (
                <li key={idx}>{nombre}</li>
              ))}
            </ul>
            <div className="mt-2 text-sm">Por favor, ajusta tu pedido o contacta al administrador.</div>
          </div>
        )}
        <button
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg transition-colors disabled:opacity-50"
          onClick={handleConfirmar}
          disabled={products.length === 0 || !direccion || loading || success}
        >
          {loading ? "Enviando pedido..." : "Confirmar pedido"}
        </button>
      </div>
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center gap-6">
            <span className="text-green-700 text-2xl font-bold">Solicitud enviada exitosamente</span>
            <button
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-colors"
              onClick={handleAceptar}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 