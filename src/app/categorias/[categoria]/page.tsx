"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/contexts/ProductContext";
import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/hooks/useCategories";

export default function CategoriaDetallePage() {
  const params = useParams();
  const raw = params?.categoria as string | undefined;
  const decoded = raw ? decodeURIComponent(raw) : "";
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");

  // Encontrar la categoría por slug o por nombre
  const category = useMemo(() => {
    return categories.find(cat => 
      cat.slug === decoded || 
      cat.name === decoded
    );
  }, [categories, decoded]);

  // Filtrar productos por el nombre de la categoría
  const categoryName = category?.name || decoded;
  const items = useMemo(() => 
    products.filter(p => Array.isArray(p.categories) && p.categories.includes(categoryName)), 
    [products, categoryName]
  );

  const loading = productsLoading || categoriesLoading;

  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{categoryName || 'Categoría'}</h1>
          <p className="text-gray-600">{sorted.length} {sorted.length === 1 ? 'producto' : 'productos'} en esta categoría</p>
        </div>
        <Link href="/categorias" className="text-blue-600 hover:underline text-sm">&larr; Ver todas</Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option value="default">Relevancia</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name-asc">Nombre: A-Z</option>
            <option value="name-desc">Nombre: Z-A</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar dentro de la categoría..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando productos...</p>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-500 mb-4">No encontramos productos que coincidan con tu búsqueda.</p>
          <Button onClick={() => {setSearch(''); setSortBy('default');}}>Restablecer filtros</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sorted.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/productos/${product.slug}`}>
                <div className="h-48 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/productos/${product.slug}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-blue-600 font-semibold mb-4">$ {product.price.toFixed(2)}</p>
                <Button fullWidth onClick={() => addToCart(product)}>Agregar al Carrito</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
