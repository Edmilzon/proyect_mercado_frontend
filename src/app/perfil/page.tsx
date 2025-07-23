"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import Spinner from "@/components/ui/Spinner/Spinner";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  nombre: string;
  correo: string;
  direccion?: string;
  telf?: string;
  foto?: string;
}

export default function PerfilPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user?.id) return;
    setLoading(true);
    fetch(`https://admi-ventas-backend.onrender.com/usuarios/${user.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const data = await res.json();
        setProfile(data);
      })
      .catch(() => setError("No se pudo cargar el perfil"))
      .finally(() => setLoading(false));
  }, [user?.id, token, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
      <span className="ml-2 text-gray-500">Cargando perfil...</span>
    </div>
  );
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-amber-200 flex flex-col items-center gap-6">
        {profile.foto ? (
          <img src={profile.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover border-4 border-amber-200" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-4xl text-amber-600 font-bold">
            {profile.nombre?.[0] || "U"}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-700 mb-1">{profile.nombre}</h1>
          <p className="text-gray-600 mb-2">{profile.correo}</p>
          <div className="flex flex-col gap-1 text-gray-700 text-sm">
            <span><b>Dirección:</b> {profile.direccion || "No registrada"}</span>
            <span><b>Teléfono:</b> {profile.telf || "No registrado"}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 