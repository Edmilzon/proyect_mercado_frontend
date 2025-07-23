"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button/Button';
import { ROUTES } from '@/config';
import Image from 'next/image';

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form);
      if (result.success) {
        if (form.correo === 'admi@admi' && form.contrasena === 'admi123') {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-lg flex flex-col gap-6 border border-amber-200">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 p-2">
            <Image
              src="/logo.jpeg"
              alt="Logo Mermeladas"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-600">Inicia sesión para comprar nuestras mermeladas artesanales</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="correo" className="text-gray-700 font-semibold">Correo electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="contrasena" className="text-gray-700 font-semibold">Contraseña</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </form>
        <Link
          href={ROUTES.REGISTER}
          className="w-full py-2 mt-4 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100 border border-amber-200 text-center transition-colors duration-200 block"
        >
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
} 