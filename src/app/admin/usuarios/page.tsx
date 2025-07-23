"use client";
import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner/Spinner";

interface User {
  id: number;
  nombre: string;
  correo: string;
  direccion?: string;
  telf?: string;
}

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("https://admi-ventas-backend.onrender.com/usuarios")
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo cargar la lista de usuarios");
        const data = await res.json();
        setUsers(data);
      })
      .catch(() => setError("No se pudo cargar la lista de usuarios"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
      <span className="ml-2 text-gray-500">Cargando usuarios...</span>
    </div>
  );
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 border border-amber-200">
      <h1 className="text-2xl font-bold text-amber-700 mb-6 text-center">Usuarios registrados</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-amber-50 rounded-lg shadow p-6 flex flex-col items-center border border-amber-100 hover:shadow-lg transition">
            <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center text-2xl font-bold text-amber-700 mb-4">
              {user.nombre?.[0] || "U"}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-amber-800 mb-1">{user.nombre}</h2>
              <p className="text-gray-700 text-sm mb-1 break-all">{user.correo}</p>
              <p className="text-gray-600 text-xs mb-1"><b>Dirección:</b> {user.direccion || "-"}</p>
              <p className="text-gray-600 text-xs"><b>Teléfono:</b> {user.telf || "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 