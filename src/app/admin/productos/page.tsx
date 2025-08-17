"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/contexts/ToastContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import BulkUploadModal from "@/components/admin/BulkUploadModal";
import BulkUploadHelp from "@/components/admin/BulkUploadHelp";

// Categorías disponibles
import { useCategories } from "@/hooks/useCategories";

export default function AdminProductsPage() {
  const { products, deleteProduct, refreshFromDatabase } = useProducts();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 5;

  // Filtrar productos por término de búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || (Array.isArray(product.categories) && product.categories.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "price") {
      comparison = a.price - b.price;
    } else if (sortField === "stock") {
      comparison = a.stock - b.stock;
    } else if (sortField === "category") {
      // Ordenar por la primera categoría si hay varias
      const aCat = Array.isArray(a.categories) && a.categories.length > 0 ? a.categories[0] : "";
      const bCat = Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : "";
      comparison = aCat.localeCompare(bCat);
    } else if (sortField === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Cambiar página
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Cambiar ordenamiento
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Estado para diálogo de confirmación
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: ""
  });

  // Manejar eliminación de producto
  const handleDeleteProduct = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Eliminar producto",
      message: `¿Estás seguro de que deseas eliminar el producto "${name}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar"
    });
    
    if (confirmed) {
      deleteProduct(id);
      showToast(
        `Producto "${name}" eliminado correctamente`,
        "success"
      );
    }
  };

  // Manejar actualización desde la base de datos
  const handleRefreshFromDatabase = async () => {
    setRefreshing(true);
    try {
      await refreshFromDatabase();
      showToast('Productos actualizados desde la base de datos', 'success');
    } catch (error) {
      console.error('Error refreshing products:', error);
      showToast('Error al actualizar productos desde la base de datos', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Manejar sincronización de productos
  const handleSyncProducts = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(`${result.synced} productos sincronizados con la base de datos`, 'success');
        
        if (result.createdCategories.length > 0) {
          showToast(`Categorías creadas: ${result.createdCategories.join(', ')}`, 'info');
        }
        
        if (result.skipped > 0) {
          showToast(`${result.skipped} productos ya existían en la base de datos`, 'info');
        }
      } else {
        showToast(result.error || 'Error durante la sincronización', 'error');
      }
    } catch (error) {
      console.error('Error during sync:', error);
      showToast('Error de conexión durante la sincronización', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Mostrar toast cuando no hay resultados tras filtrar (evitar llamar desde el render)
  useEffect(() => {
    // Mostrar aviso solo si ya hay productos cargados y el filtrado devuelve 0
    if (filteredProducts.length === 0 && products.length > 0) {
      showToast('No se encontraron productos', 'warning');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts.length, searchTerm, selectedCategory]);

  if (categoriesLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="animate-pulse">Cargando categorías...</span>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todos los productos de tu tienda
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefreshFromDatabase}
            variant="outline"
            disabled={refreshing}
          >
            <ArrowDownIcon className="h-5 w-5 mr-2" />
            {refreshing ? 'Cargando...' : 'Refrescar BD'}
          </Button>
          <Button
            onClick={handleSyncProducts}
            variant="outline"
            disabled={syncing || products.length === 0}
          >
            <ArrowUpIcon className="h-5 w-5 mr-2" />
            {syncing ? 'Sincronizando...' : 'Sincronizar BD'}
          </Button>
          <Button
            onClick={() => setShowBulkUpload(true)}
            variant="outline"
          >
            <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
            Carga Masiva
          </Button>
          <Link href="/admin/productos/nuevo">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Ayuda para carga masiva */}
      <BulkUploadHelp />

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
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {categories && categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end">
            <Button
              onClick={() => { setSearchTerm(""); setSelectedCategory("Todas"); setCurrentPage(1); showToast('Filtros limpiados', 'info'); }}
              aria-label="Limpiar filtros"
              className="border rounded px-3 py-2 text-sm hover:bg-gray-50"
            >Limpiar</Button>
          </div>
          
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {filteredProducts.length === 0 ? 'Sin resultados' : `Mostrando ${currentItems.length} de ${filteredProducts.length} productos`}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("name")}
                  >
                    Producto
                    {sortField === "name" && (
                      sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("category")}
                  >
                    Categoría
                    {sortField === "category" && (
                      sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("price")}
                  >
                    Precio
                    {sortField === "price" && (
                      sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("stock")}
                  >
                    Stock
                    {sortField === "stock" && (
                      sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destacado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    Fecha
                    {sortField === "createdAt" && (
                      sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={product.image}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Array.isArray(product.categories) && product.categories.length > 0
                        ? product.categories.join(", ")
                        : <span className="italic text-gray-400">Sin categoría</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {product.stock} unidades
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.featured ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sí
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 border border-blue-200 rounded-md p-1.5 hover:bg-blue-50"
                        title="Editar producto"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-600 hover:text-red-900 border border-red-200 rounded-md p-1.5 hover:bg-red-50"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredProducts.length)}
                  </span>{" "}
                  de <span className="font-medium">{filteredProducts.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === index + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Toast de notificación es manejado por el ToastContext */}

      {/* Diálogo de confirmación es manejado por el ConfirmContext */}
      
      {/* Modal de carga masiva */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
      />
    </div>
  );
}
