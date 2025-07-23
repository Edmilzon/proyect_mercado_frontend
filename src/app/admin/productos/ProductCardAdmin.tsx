"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Dialog from '@/components/ui/Dialog';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dl4qmorch/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "ximena";
const API_URL = "https://admi-ventas-backend.onrender.com/productos";

export interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  stock: number;
}

interface Props {
  prod: ProductoAdmin;
  onUpdated: () => void;
  onDeleted: (id: number) => void;
}

export default function ProductCardAdmin({ prod, onUpdated, onDeleted }: Props) {
  // Edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: prod.nombre,
    descripcion: prod.descripcion,
    precio: prod.precio.toString(),
    imagen: prod.imagen || '',
    stock: prod.stock.toString()
  });
  const [editImagePreview, setEditImagePreview] = useState(prod.imagen || '');
  const [editUploading, setEditUploading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Eliminar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Stock
  const [stockUpdating, setStockUpdating] = useState(false);
  const [stockValue, setStockValue] = useState('');
  const [stockError, setStockError] = useState('');
  const [stockSuccess, setStockSuccess] = useState('');

  // Editar producto
  const openEditModal = () => {
    setEditForm({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio.toString(),
      imagen: prod.imagen || '',
      stock: prod.stock.toString()
    });
    setEditImagePreview(prod.imagen || '');
    setEditError('');
    setEditSuccess('');
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setEditForm((prev) => ({ ...prev, imagen: data.secure_url }));
        setEditImagePreview(data.secure_url);
      } else {
        setEditError('No se pudo subir la imagen');
      }
    } catch {
      setEditError('No se pudo subir la imagen');
    } finally {
      setEditUploading(false);
    }
  };

  const handleEditImageClick = () => {
    if (editFileInputRef.current) editFileInputRef.current.click();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editForm.nombre,
          descripcion: editForm.descripcion,
          precio: parseFloat(editForm.precio),
          imagen: editForm.imagen || undefined,
          stock: parseInt(editForm.stock, 10)
        })
      });
      if (!res.ok) throw new Error('No se pudo editar el producto');
      setEditSuccess('Producto editado correctamente');
      setEditModalOpen(false);
      onUpdated();
    } catch {
      setEditError('No se pudo editar el producto');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Eliminar producto
  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await fetch(`${API_URL}/${prod.id}`, { method: 'DELETE' });
      setDeleteModalOpen(false);
      onDeleted(prod.id);
    } catch {
      alert('No se pudo eliminar el producto');
    }
  };

  // Stock
  const handleStockChange = (value: string) => {
    setStockValue(value);
    setStockError('');
    setStockSuccess('');
  };
  const handleStockUpdate = async () => {
    if (stockValue === '' || isNaN(Number(stockValue))) {
      setStockError('Ingrese una cantidad válida');
      return;
    }
    const cantidad = Number(stockValue);
    const nuevoStock = prod.stock + cantidad;
    if (nuevoStock < 0) {
      setStockError('El stock no puede ser negativo');
      return;
    }
    setStockUpdating(true);
    setStockError('');
    setStockSuccess('');
    try {
      const res = await fetch(`${API_URL}/${prod.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock })
      });
      if (!res.ok) throw new Error('No se pudo actualizar el stock');
      setStockSuccess('Stock actualizado');
      setStockValue('');
      onUpdated();
    } catch {
      setStockError('Error al actualizar stock');
    } finally {
      setStockUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded aspect-square overflow-hidden">
        {prod.imagen ? (
          <Image src={prod.imagen} alt={prod.nombre} width={96} height={96} className="object-contain w-full h-full" />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>
      <div className="flex-1 w-full">
        <div className="font-bold text-lg text-amber-800">{prod.nombre}</div>
        <div className="text-gray-600 mb-1">{prod.descripcion}</div>
        <div className="text-gray-700">Precio: <span className="font-semibold">S/ {prod.precio}</span></div>
        <div className="text-gray-700">Stock: <span className="font-semibold">{prod.stock}</span></div>
        <div className="flex gap-3 justify-center mt-4">
          <button
            className="px-4 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition text-sm"
            title="Editar producto"
            onClick={openEditModal}
          >
            Editar
          </button>
          <button
            onClick={openDeleteModal}
            className="px-4 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition text-sm"
            title="Eliminar producto"
          >
            Eliminar
          </button>
        </div>
        <div className="mt-3 w-full flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 w-full max-w-xs justify-center">
            <button
              type="button"
              className="px-2 py-1 bg-amber-200 text-amber-700 rounded hover:bg-amber-300 font-bold text-lg"
              onClick={() => handleStockChange(((Number(stockValue) - 1).toString()))}
              disabled={stockUpdating}
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <input
              type="number"
              style={{ width: '60px' }}
              placeholder="Cantidad"
              value={stockValue}
              onChange={e => handleStockChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm text-center"
              disabled={stockUpdating}
            />
            <button
              type="button"
              className="px-2 py-1 bg-amber-200 text-amber-700 rounded hover:bg-amber-300 font-bold text-lg"
              onClick={() => handleStockChange(((Number(stockValue) + 1).toString()))}
              disabled={stockUpdating}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
            <span className="ml-2 text-xs text-gray-600">Stock actual: <b className="text-amber-700">{prod.stock}</b></span>
          </div>
          <button
            onClick={handleStockUpdate}
            className="mt-2 px-4 py-1 bg-amber-500 text-white rounded font-bold hover:bg-amber-600 transition text-sm"
            disabled={stockUpdating}
          >
            {stockUpdating ? 'Actualizando...' : 'Actualizar'}
          </button>
          {stockError && <div className="text-red-600 text-xs font-bold">{stockError}</div>}
          {stockSuccess && <div className="text-green-700 text-xs font-bold">{stockSuccess}</div>}
        </div>
      </div>
      {/* Modal de edición */}
      {editModalOpen && (
        <Dialog onClose={() => setEditModalOpen(false)}>
          <form className="bg-white rounded-lg shadow p-6 grid gap-4 w-full max-w-md mx-auto" onSubmit={handleEditSubmit}>
            <h3 className="text-xl font-bold mb-2 text-amber-700">Editar producto</h3>
            <div>
              <label className="block font-semibold mb-1">Nombre</label>
              <input name="nombre" value={editForm.nombre} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea name="descripcion" value={editForm.descripcion} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Precio</label>
                <input name="precio" type="number" step="0.01" value={editForm.precio} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Stock</label>
                <input name="stock" type="number" value={editForm.stock} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Imagen</label>
              <div
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-0 cursor-pointer transition hover:border-amber-500 bg-amber-50 aspect-square w-full max-w-xs mx-auto ${editUploading ? 'opacity-60 pointer-events-none' : ''}`}
                style={{ minHeight: '220px', minWidth: '220px', maxWidth: '320px' }}
                onClick={handleEditImageClick}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  ref={editFileInputRef}
                  className="hidden"
                  disabled={editUploading}
                />
                {editImagePreview ? (
                  <>
                    <Image
                      src={editImagePreview}
                      alt="Preview"
                      width={220}
                      height={220}
                      className="w-full h-full object-contain rounded border shadow aspect-square"
                      style={{ minHeight: '200px', minWidth: '200px', maxHeight: '300px', maxWidth: '300px' }}
                    />
                    <button
                      type="button"
                      onClick={handleEditImageClick}
                      className="px-3 py-1 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 transition text-sm mt-2"
                      disabled={editUploading}
                    >
                      Cambiar imagen
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 justify-center w-full h-full min-h-[200px] min-w-[200px] aspect-square">
                    <PhotoIcon className="w-14 h-14 text-amber-400" />
                    <span className="text-gray-500 font-semibold">Haz clic o arrastra una imagen aquí</span>
                    {editUploading && <span className="text-amber-700 font-bold mt-2">Subiendo imagen...</span>}
                  </div>
                )}
              </div>
            </div>
            {editError && <div className="text-red-600 font-bold">{editError}</div>}
            {editSuccess && <div className="text-green-700 font-bold">{editSuccess}</div>}
            <button type="submit" className="bg-amber-700 text-white px-6 py-2 rounded font-bold hover:bg-amber-800 transition" disabled={editSubmitting || editUploading}>
              {editSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </Dialog>
      )}
      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && (
        <Dialog onClose={() => setDeleteModalOpen(false)}>
          <div className="p-4 flex flex-col items-center">
            <div className="text-3xl text-red-600 mb-2">&#9888;</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">¿Estás seguro que deseas eliminar este producto?</h3>
            <p className="text-gray-600 mb-4 text-center">Esta acción no se puede deshacer.<br/>Producto: <span className="font-semibold text-amber-700">{prod.nombre}</span></p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
} 