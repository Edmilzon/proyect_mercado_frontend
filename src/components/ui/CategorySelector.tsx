'use client';

import React, { useState, useEffect } from 'react';
import { CategoriaProducto } from '@/types';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  className?: string;
  placeholder?: string;
}

interface CategoryLevel {
  categoria_id: string;
  nombre: string;
  subcategorias: CategoriaProducto[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Seleccionar categoría'
}) => {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string>('');
  const [selectedLevel2, setSelectedLevel2] = useState<string>('');
  const [selectedLevel3, setSelectedLevel3] = useState<string>('');
  const [level2Options, setLevel2Options] = useState<CategoriaProducto[]>([]);
  const [level3Options, setLevel3Options] = useState<CategoriaProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para construir la jerarquía de categorías
  const buildCategoryHierarchy = (flatCategories: CategoriaProducto[]) => {
    // Crear un mapa de todas las categorías
    const categoryMap = new Map<string, CategoriaProducto>();
    flatCategories.forEach(cat => {
      categoryMap.set(cat.categoria_id, { ...cat, subcategorias: [] });
    });

    // Construir la jerarquía
    const rootCategories: CategoriaProducto[] = [];
    
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.categoria_id)!;
      
      if (!cat.categoria_padre_id) {
        // Es una categoría raíz
        rootCategories.push(category);
      } else {
        // Es una subcategoría
        const parent = categoryMap.get(cat.categoria_padre_id);
        if (parent) {
          if (!parent.subcategorias) {
            parent.subcategorias = [];
          }
          parent.subcategorias.push(category);
        }
      }
    });

    return rootCategories;
  };

  // Cargar categorías principales
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://proyect-mercado-backend.fly.dev/api/categorias');
        const data = await response.json();
        
        // Construir la jerarquía desde la lista plana
        const hierarchicalCategories = buildCategoryHierarchy(data.categorias);
        setCategories(hierarchicalCategories);
        
        console.log('Categorías jerárquicas construidas:', hierarchicalCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Actualizar opciones del nivel 2 cuando cambie el nivel 1
  useEffect(() => {
    if (selectedLevel1) {
      const level1Category = categories.find(cat => cat.categoria_id === selectedLevel1);
      if (level1Category && level1Category.subcategorias && level1Category.subcategorias.length > 0) {
        setLevel2Options(level1Category.subcategorias);
        setSelectedLevel2('');
        setSelectedLevel3('');
      } else {
        setLevel2Options([]);
        setSelectedLevel2('');
        setSelectedLevel3('');
      }
    } else {
      setLevel2Options([]);
      setSelectedLevel2('');
      setSelectedLevel3('');
    }
  }, [selectedLevel1, categories]);

  // Actualizar opciones del nivel 3 cuando cambie el nivel 2
  useEffect(() => {
    if (selectedLevel2) {
      const level2Category = level2Options.find(cat => cat.categoria_id === selectedLevel2);
      if (level2Category && level2Category.subcategorias && level2Category.subcategorias.length > 0) {
        setLevel3Options(level2Category.subcategorias);
        setSelectedLevel3('');
      } else {
        setLevel3Options([]);
        setSelectedLevel3('');
      }
    } else {
      setLevel3Options([]);
      setSelectedLevel3('');
    }
  }, [selectedLevel2, level2Options]);

  // Actualizar el valor final cuando cambie cualquier nivel
  useEffect(() => {
    const finalCategoryId = selectedLevel3 || selectedLevel2 || selectedLevel1;
    if (finalCategoryId && finalCategoryId !== value) {
      onChange(finalCategoryId);
    }
  }, [selectedLevel1, selectedLevel2, selectedLevel3, onChange, value]);

  // Inicializar valores cuando se proporcione un value inicial
  useEffect(() => {
    if (value && !selectedLevel1 && !selectedLevel2 && !selectedLevel3) {
      // Buscar la categoría seleccionada en todos los niveles
      const findCategoryPath = (cats: CategoriaProducto[], targetId: string): string[] => {
        for (const cat of cats) {
          if (cat.categoria_id === targetId) {
            return [cat.categoria_id];
          }
          if (cat.subcategorias) {
            const path = findCategoryPath(cat.subcategorias, targetId);
            if (path.length > 0) {
              return [cat.categoria_id, ...path];
            }
          }
        }
        return [];
      };

      const path = findCategoryPath(categories, value);
      if (path.length > 0) {
        setSelectedLevel1(path[0]);
        if (path.length > 1) {
          setSelectedLevel2(path[1]);
        }
        if (path.length > 2) {
          setSelectedLevel3(path[2]);
        }
      }
    }
  }, [value, categories, selectedLevel1, selectedLevel2, selectedLevel3]);

  const handleLevel1Change = (categoryId: string) => {
    setSelectedLevel1(categoryId);
  };

  const handleLevel2Change = (categoryId: string) => {
    setSelectedLevel2(categoryId);
  };

  const handleLevel3Change = (categoryId: string) => {
    setSelectedLevel3(categoryId);
  };

  const getSelectedCategoryName = () => {
    if (selectedLevel3) {
      const level3Cat = level3Options.find(cat => cat.categoria_id === selectedLevel3);
      return level3Cat?.nombre;
    }
    if (selectedLevel2) {
      const level2Cat = level2Options.find(cat => cat.categoria_id === selectedLevel2);
      return level2Cat?.nombre;
    }
    if (selectedLevel1) {
      const level1Cat = categories.find(cat => cat.categoria_id === selectedLevel1);
      return level1Cat?.nombre;
    }
    return placeholder;
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-10 rounded-md ${className}`} />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Nivel 1 - Categorías principales */}
      <select
        value={selectedLevel1}
        onChange={(e) => handleLevel1Change(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option key={category.categoria_id} value={category.categoria_id}>
            {category.nombre}
          </option>
        ))}
      </select>

      {/* Nivel 2 - Subcategorías */}
      {selectedLevel1 && level2Options.length > 0 && (
        <select
          value={selectedLevel2}
          onChange={(e) => handleLevel2Change(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar subcategoría</option>
          {level2Options.map((category) => (
            <option key={category.categoria_id} value={category.categoria_id}>
              {category.nombre}
            </option>
          ))}
        </select>
      )}

      {/* Nivel 3 - Sub-subcategorías */}
      {selectedLevel2 && level3Options.length > 0 && (
        <select
          value={selectedLevel3}
          onChange={(e) => handleLevel3Change(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar sub-subcategoría</option>
          {level3Options.map((category) => (
            <option key={category.categoria_id} value={category.categoria_id}>
              {category.nombre}
            </option>
          ))}
        </select>
      )}

      {/* Mostrar categoría seleccionada */}
      {(selectedLevel1 || selectedLevel2 || selectedLevel3) && (
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          <span className="font-medium">Categoría seleccionada:</span> {getSelectedCategoryName()}
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-2">
          Debug: L1={selectedLevel1}, L2={selectedLevel2}, L3={selectedLevel3} | 
          L2 options: {level2Options.length}, L3 options: {level3Options.length}
        </div>
      )}
    </div>
  );
}; 