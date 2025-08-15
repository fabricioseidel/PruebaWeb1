"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productsCount: number;
  isActive: boolean;
};

// Los datos ahora provienen de la API (/api/categories)

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  // Modal para crear/editar categoría
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Estado para el formulario de categoría
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; slug?: string }>({});

  // Cargar categorías desde la API al montar
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setGlobalError(null);
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        if (!res.ok) throw new Error('No se pudieron cargar las categorías');
        const data: Category[] = await res.json();
        if (!cancelled) setCategories(data);
      } catch (e: any) {
        if (!cancelled) setGlobalError(e.message || 'Error desconocido');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const normalizeSlug = (value: string) => value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  // Filtrar categorías
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = showInactiveCategories || category.isActive;
    
    return matchesSearch && matchesStatus;
  });

  // Abrir modal para crear nueva categoría
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar categoría
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : value,
    }));
    
    // Generar slug automáticamente desde el nombre
    if (name === "name") {
      const slug = normalizeSlug(value);
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Limpiar errores al escribir
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Manejar checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Guardar categoría
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validaciones básicas
    const errors: { name?: string; slug?: string } = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    const finalSlug = normalizeSlug(formData.slug);
    if (!finalSlug) errors.slug = 'El slug es obligatorio';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setGlobalError(null);
    try {
      if (editingCategory) {
        // Actualizar categoría existente vía API
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: finalSlug,
            description: formData.description,
            isActive: formData.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) setFormErrors(prev => ({ ...prev, slug: data.error || 'Slug o nombre ya existe' }));
          else setGlobalError(data.error || 'No se pudo actualizar la categoría');
          return;
        }
        setCategories(prev => prev.map(c => c.id === data.id ? data : c));
        showToast(`Categoría "${formData.name}" actualizada correctamente`, "success");
      } else {
        // Crear nueva categoría vía API
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: finalSlug,
            description: formData.description,
            isActive: formData.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) setFormErrors(prev => ({ ...prev, slug: data.error || 'Slug o nombre ya existe' }));
          else setGlobalError(data.error || 'No se pudo crear la categoría');
          return;
        }
        setCategories(prev => [data, ...prev]);
        showToast(`Categoría "${formData.name}" creada correctamente`, "success");
      }
      // Cerrar modal
      setIsModalOpen(false);
    } catch (err: any) {
      setGlobalError(err.message || 'Error de red');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const confirmed = await confirm({
      title: "Eliminar categoría",
      message: `¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      confirmButtonClass: "bg-red-600 hover:bg-red-700"
    });
    
    if (!confirmed) return;
    
    setGlobalError(null);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'No se pudo eliminar la categoría', "error");
        return;
      }
      setCategories(prev => prev.filter((cat) => cat.id !== categoryId));
      showToast(`Categoría "${category.name}" eliminada correctamente`, "success");
    } catch (e: any) {
      setGlobalError(e.message || 'Error eliminando la categoría');
    }
  };

  // Alternar estado de categoría (activa/inactiva)
  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const confirmed = await confirm({
      title: category.isActive ? "Desactivar categoría" : "Activar categoría",
      message: `¿Estás seguro de que deseas ${category.isActive ? "desactivar" : "activar"} la categoría "${category.name}"?`,
      confirmText: category.isActive ? "Desactivar" : "Activar",
      cancelText: "Cancelar",
      confirmButtonClass: category.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
    });
    
    if (!confirmed) return;
    
    setGlobalError(null);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'No se pudo actualizar el estado', "error");
        return;
      }
      setCategories(prev => prev.map(c => c.id === categoryId ? data : c));
      showToast(`Categoría "${category.name}" ${category.isActive ? "desactivada" : "activada"} correctamente`, "success");
    } catch (e: any) {
      setGlobalError(e.message || 'Error actualizando estado');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las categorías de productos de tu tienda
          </p>
        </div>
        <Button onClick={handleCreateCategory}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Mensaje de error global */}
      {globalError && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {globalError}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="showInactive"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={showInactiveCategories}
              onChange={(e) => setShowInactiveCategories(e.target.checked)}
            />
            <label htmlFor="showInactive" className="ml-2 block text-sm text-gray-900">
              Mostrar categorías inactivas
            </label>
          </div>
          
          <div className="text-right flex items-center justify-end">
            <span className="text-sm text-gray-500">
              Mostrando {filteredCategories.length} de {categories.length} categorías
            </span>
          </div>
        </div>
      </div>

    {/* Tabla de categorías */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    Cargando categorías...
                  </td>
                </tr>
              ) : filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.productsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 rounded-md p-1.5 hover:bg-indigo-50"
                        title="Editar categoría"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => toggleCategoryStatus(category.id)}
                        className={`text-sm py-1 px-2 rounded ${
                          category.isActive
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                        title={category.isActive ? "Desactivar categoría" : "Activar categoría"}
                      >
                        {category.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900 border border-red-200 rounded-md p-1.5 hover:bg-red-50"
                        disabled={category.productsCount > 0}
                        title={category.productsCount > 0 ? "No se puede eliminar una categoría con productos" : "Eliminar categoría"}
                      >
                        <TrashIcon className={`h-5 w-5 ${category.productsCount > 0 ? "opacity-50 cursor-not-allowed" : ""}`} />
                      </button>
                    </div>
                  </td>
                </tr>
      ))}
            </tbody>
          </table>
        </div>
        
        {/* Sin resultados */}
    {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron categorías con los criterios de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50" onClick={() => setIsModalOpen(false)}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" onClick={e => e.stopPropagation()}>
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSaveCategory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {editingCategory ? "Editar categoría" : "Nueva categoría"}
                      </h3>
                      <div className="mt-4 space-y-4">
                        {/* Nombre */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.name}
                            onChange={handleChange}
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                          )}
                        </div>

                        {/* Slug */}
                        <div>
                          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                            Slug *
                          </label>
                          <input
                            type="text"
                            name="slug"
                            id="slug"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.slug}
                            onChange={handleChange}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Identificador único para la URL (ej: laptops, smartphones)
                          </p>
                          {formErrors.slug && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>
                          )}
                        </div>

                        {/* Descripción */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descripción
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.description}
                            onChange={handleChange}
                          ></textarea>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center">
                          <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={formData.isActive}
                            onChange={handleCheckboxChange}
                          />
                          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                            Categoría activa
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={saving}
                  >
                    {saving ? 'Guardando…' : editingCategory ? "Actualizar" : "Crear"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
