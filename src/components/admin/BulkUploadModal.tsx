"use client";

import { useState } from "react";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { useProducts } from "@/contexts/ProductContext";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: string[];
  image?: string;
  slug?: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useToast();
  const { refreshFromDatabase } = useProducts();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json'].includes(fileExtension || '')) {
      showToast('Solo se permiten archivos CSV o JSON', 'error');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    try {
      const text = await file.text();
      let products: Product[] = [];

      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        products = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else if (file.name.endsWith('.csv')) {
        products = parseCSV(text);
      }

      // Validar y normalizar productos
      const validProducts = products
        .map((product, index) => validateProduct(product, index))
        .filter((product): product is Product => product !== null);

      setPreview(validProducts);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing file:', error);
      showToast('Error al procesar el archivo. Verifica el formato.', 'error');
    }
  };

  const parseCSV = (csvText: string): Product[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const product: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'name':
          case 'nombre':
            product.name = value;
            break;
          case 'description':
          case 'descripcion':
            product.description = value;
            break;
          case 'price':
          case 'precio':
            product.price = parseFloat(value) || 0;
            break;
          case 'stock':
            product.stock = parseInt(value) || 0;
            break;
          case 'categories':
          case 'categorias':
            product.categories = value ? value.split(';').map(c => c.trim()) : [];
            break;
          case 'image':
          case 'imagen':
            product.image = value;
            break;
        }
      });

      if (product.name) {
        products.push(product);
      }
    }

    return products;
  };

  const validateProduct = (product: any, index: number): Product | null => {
    try {
      if (!product.name || typeof product.name !== 'string') {
        console.warn(`Producto en línea ${index + 1}: nombre requerido`);
        return null;
      }

      const validProduct: Product = {
        name: product.name.trim(),
        description: (product.description || '').toString().trim(),
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        stock: typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0,
        categories: Array.isArray(product.categories) ? product.categories : 
                   typeof product.categories === 'string' ? product.categories.split(',').map((c: string) => c.trim()) : [],
        image: product.image || '/file.svg',
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      if (validProduct.price < 0) validProduct.price = 0;
      if (validProduct.stock < 0) validProduct.stock = 0;

      return validProduct;
    } catch (error) {
      console.warn(`Error validando producto en línea ${index + 1}:`, error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!preview.length) {
      showToast('No hay productos válidos para cargar', 'warning');
      return;
    }

    setUploading(true);
    try {
      showToast('Iniciando carga masiva...', 'info');
      
      // Usar el endpoint de carga masiva
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: preview }),
      });

      const result = await response.json();

      if (response.ok) {
        // Mostrar resultados detallados
        showToast(result.message || `${result.success} productos cargados exitosamente`, 'success');
        
        if (result.createdCategories && result.createdCategories.length > 0) {
          showToast(`✨ Nuevas categorías: ${result.createdCategories.join(', ')}`, 'info');
        }
        
        if (result.skipped > 0) {
          showToast(`⏭️ ${result.skipped} productos omitidos (ya existían)`, 'info');
        }
        
        if (result.errors && result.errors.length > 0) {
          console.warn('Errores durante la carga:', result.errors);
          showToast(`⚠️ ${result.errors.length} productos con errores (ver consola)`, 'warning');
        }

        // Cerrar modal y refrescar productos desde la base de datos
        handleClose();
        
        // Esperar un momento y luego refrescar desde la base de datos
        setTimeout(async () => {
          await refreshFromDatabase();
        }, 500);
      } else {
        showToast(`❌ ${result.error || 'Error durante la carga masiva'}`, 'error');
      }
    } catch (error) {
      console.error('Error during bulk upload:', error);
      showToast('❌ Error de conexión durante la carga masiva', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setShowPreview(false);
    onClose();
  };

  const downloadTemplate = () => {
    const csvTemplate = `name,description,price,stock,categories,image
Producto Ejemplo,Descripción del producto ejemplo,25.99,100,Categoría 1;Categoría 2,/productos/ejemplo.jpg
Otro Producto,Otra descripción,15.50,50,Categoría 1,/productos/otro.jpg`;

    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Carga Masiva de Productos</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!showPreview ? (
            <>
              {/* Instrucciones */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Formatos Soportados:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>CSV:</strong> Archivo separado por comas con encabezados</li>
                  <li>• <strong>JSON:</strong> Array de objetos con propiedades de producto</li>
                </ul>
              </div>

              {/* Campos requeridos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Campos CSV:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div><strong>name:</strong> Nombre del producto (requerido)</div>
                  <div><strong>description:</strong> Descripción</div>
                  <div><strong>price:</strong> Precio (número)</div>
                  <div><strong>stock:</strong> Inventario (número)</div>
                  <div><strong>categories:</strong> Categorías separadas por ;</div>
                  <div><strong>image:</strong> URL de imagen</div>
                </div>
              </div>

              {/* Botón de plantilla */}
              <div className="text-center">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="mb-4"
                >
                  📥 Descargar Plantilla CSV
                </Button>
              </div>

              {/* Área de subida */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-900">
                      Arrastra un archivo aquí o haz clic para seleccionar
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">CSV o JSON hasta 10MB</p>
              </div>
            </>
          ) : (
            <>
              {/* Vista previa */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  Vista Previa - {preview.length} productos encontrados
                </h3>
                <p className="text-sm text-green-800">
                  Revisa los datos antes de confirmar la carga
                </p>
              </div>

              {/* Tabla de preview */}
              <div className="max-h-80 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Precio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Categorías
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 10).map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {product.categories.join(', ') || 'Sin categoría'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500">
                    ... y {preview.length - 10} productos más
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={uploading}
                >
                  Volver
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 relative"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    `🚀 Cargar ${preview.length} Productos`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
