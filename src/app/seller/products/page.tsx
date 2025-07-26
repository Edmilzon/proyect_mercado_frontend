'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CategorySelector } from '@/components/ui/CategorySelector';
import Navbar from '@/components/layout/Navbar';
import { productsService } from '@/services/products';
import { categoriesService } from '@/services/categories';
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

import { Producto, CategoriaProducto, ImagenProducto } from '@/types';

type Categoria = CategoriaProducto;

export default function ProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_base: 0,
    precio_actual: 0,
    categoria_id: '',
    cantidad_stock: 0,
    url_imagen_principal: '',
    imagenes: [] as string[],
    peso_g: 0,
    esta_activo: true
  });
  const [uploadedImages, setUploadedImages] = useState<unknown[]>([]);

  // Redirigir si no está autenticado o no es vendedor
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.rol !== 'vendedor') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Cargar productos y categorías
  useEffect(() => {
    if (user && user.rol === 'vendedor') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar productos y categorías desde las APIs
      const [productsData, categoriesData] = await Promise.all([
        productsService.getProducts(),
        categoriesService.getCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Si hay error, mostrar arrays vacíos
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Actualizar producto
        const { imagenes, ...productData } = formData;
        const updatedProduct = await productsService.updateProduct(editingId, productData);
        setProducts(prev => prev.map(prod => 
          prod.producto_id === editingId 
            ? updatedProduct
            : prod
        ));
        setEditingId(null);
      } else {
        // Crear producto
        const newProduct = await productsService.createProduct({
          ...formData,
          sku: `SKU${Date.now()}`,
        });
        setProducts(prev => [...prev, newProduct]);
        setIsAdding(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Inténtalo de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productsService.deleteProduct(id);
        setProducts(prev => prev.filter(prod => prod.producto_id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto. Inténtalo de nuevo.');
      }
    }
  };

  const handleEdit = (product: Producto) => {
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio_base: product.precio_base,
      precio_actual: product.precio_actual,
      categoria_id: product.categoria_id,
      cantidad_stock: product.cantidad_stock,
      url_imagen_principal: product.url_imagen_principal || '',
      imagenes: product.imagenes?.map(img => img.url_imagen) || [],
      peso_g: product.peso_g || 0,
      esta_activo: product.esta_activo
    });
    setEditingId(product.producto_id);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio_base: 0,
      precio_actual: 0,
      categoria_id: '',
      cantidad_stock: 0,
      url_imagen_principal: '',
      imagenes: [],
      peso_g: 0,
      esta_activo: true
    });
  };

  const handleImageUpload = (response: unknown) => {
    const typedResponse = response as { public_id: string };
    setFormData(prev => ({
      ...prev,
      url_imagen_principal: typedResponse.public_id
    }));
    setUploadedImages(prev => [response]);
  };

  const handleMultipleImageUpload = (response: unknown) => {
    const typedResponse = response as { public_id: string };
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, typedResponse.public_id]
    }));
    setUploadedImages(prev => [...prev, response]);
  };

  const handleRemoveImage = (publicId: string) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter(id => id !== publicId)
    }));
    setUploadedImages(prev => prev.filter(img => (img as { public_id: string }).public_id !== publicId));
  };

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los vendedores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/seller/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Mis Productos</h1>
            </div>
            <p className="text-gray-600">
              Gestiona tu catálogo de productos
            </p>
          </div>

          {/* Add New Product Button */}
          {!isAdding && !editingId && (
            <div className="mb-6">
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-black text-white hover:bg-gray-800"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Nuevo Producto
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre del Producto"
                    placeholder="Ej: Smartphone Samsung"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Precio Base"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.precio_base}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_base: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Precio Actual"
                    type="number"
                    step="0.01"
                    placeholder="90.00"
                    value={formData.precio_actual}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_actual: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                  
                  <Input
                    label="Stock"
                    type="number"
                    placeholder="50"
                    value={formData.cantidad_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, cantidad_stock: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <CategorySelector
                      value={formData.categoria_id}
                      onChange={(categoryId) => setFormData(prev => ({ ...prev, categoria_id: categoryId }))}
                      placeholder="Seleccionar categoría principal"
                    />
                  </div>
                  
                  <Input
                    label="Peso (gramos)"
                    type="number"
                    placeholder="500"
                    value={formData.peso_g}
                    onChange={(e) => setFormData(prev => ({ ...prev, peso_g: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe tu producto..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Principal
                  </label>
                  <ImageUpload
                    onUpload={handleImageUpload}
                    onError={(error) => console.error('Error uploading image:', error)}
                    onRemove={handleRemoveImage}
                    multiple={false}
                    maxFiles={1}
                    folder="productos"
                    maxSize={5}
                    showPreview={true}
                    uploadedImages={uploadedImages.filter(img => (img as { public_id: string }).public_id === formData.url_imagen_principal) as any}
                  />
                  {formData.url_imagen_principal && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Imagen principal subida correctamente
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes Adicionales
                  </label>
                  <ImageUpload
                    onUpload={handleMultipleImageUpload}
                    onError={(error) => console.error('Error uploading images:', error)}
                    onRemove={handleRemoveImage}
                    multiple={true}
                    maxFiles={5}
                    folder="productos"
                    maxSize={5}
                    showPreview={true}
                    uploadedImages={uploadedImages.filter(img => formData.imagenes.includes((img as { public_id: string }).public_id)) as any}
                  />
                  {formData.imagenes.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.imagenes.length} imagen(es) adicional(es) subida(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="esta_activo"
                    checked={formData.esta_activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, esta_activo: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="esta_activo" className="text-sm text-gray-700">
                    Producto activo (visible para compradores)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    {editingId ? 'Actualizar Producto' : 'Crear Producto'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tienes productos registrados</p>
                <p className="text-gray-500 text-sm">Agrega tu primer producto para comenzar a vender</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.producto_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Product Image */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {product.url_imagen_principal ? (
                        <img
                          src={product.url_imagen_principal}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {product.nombre}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.descripcion}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            ${product.precio_actual}
                          </span>
                          {product.precio_base !== product.precio_actual && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.precio_base}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TagIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Stock: {product.cantidad_stock}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.esta_activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.esta_activo ? 'Activo' : 'Inactivo'}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.producto_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 