"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";

// Derivamos categorías dinámicamente desde los productos + "Todas"
function useCategoryOptions(products: { category: string }[]) {
  return useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.category && set.add(p.category));
    return ["Todas", ...Array.from(set).sort()];
  }, [products]);
}

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useCart();
  const categories = useCategoryOptions(products);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    return 0; // default
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Productos</h1>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              id="sort"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Relevancia</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'producto' : 'productos'} encontrados
        </p>
      </div>
      
      {/* Lista de productos */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <Link href={`/productos/${product.slug}`} className="block h-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <Link href={`/productos/${product.slug}`} className="block">
                  <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-1 text-[11px] text-gray-500">
                  <span>👁 {product.viewCount ?? 0}</span>
                  <span>🛒 {product.orderClicks ?? 0}</span>
                </div>
                <p className="text-gray-500 mb-2 flex items-center gap-2">
                  <span>{product.category}</span>
                  {product.stock <= 5 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pocas</span>}
                </p>
                <div className="mb-4 flex items-center gap-2">
                  <p className="text-blue-600 font-semibold">$ {product.price.toFixed(2)}</p>
                  {product.priceOriginal && product.priceOriginal > product.price && (
                    <>
                      <span className="text-xs line-through text-gray-400">$ {product.priceOriginal.toFixed(2)}</span>
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded">
                        -{Math.round(((product.priceOriginal - product.price)/product.priceOriginal)*100)}%
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-auto">
                  <Button fullWidth onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-500 mb-4">Intenta con otros criterios de búsqueda</p>
          <Button onClick={() => {setSearchTerm(''); setSelectedCategory('Todas');}}>
            Ver todos los productos
          </Button>
        </div>
      )}
    </div>
  );
}
