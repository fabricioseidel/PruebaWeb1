"use client";

import Link from "next/link";
import { useProducts } from "@/contexts/ProductContext";
import { useMemo } from "react";

export default function CategoriasPage() {
  const { products, loading } = useProducts();

  const categoryData = useMemo(() => {
    const map = new Map<string, { count: number; image?: string }>();
    products.forEach(p => {
      if (!map.has(p.category)) {
        map.set(p.category, { count: 0, image: p.image });
      }
      map.get(p.category)!.count += 1;
    });
    return Array.from(map.entries())
      .map(([name, info]) => ({ name, count: info.count, image: info.image }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorías</h1>
        <p className="text-gray-600">Explora los productos agrupados por categoría.</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando categorías...</p>
      ) : categoryData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
          <p className="text-gray-500">Aún no se han agregado productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryData.map(cat => (
            <Link key={cat.name} href={`/categorias/${encodeURIComponent(cat.name)}`} className="group block bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
              <div className="h-40 overflow-hidden bg-gray-100">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.count} {cat.count === 1 ? 'producto' : 'productos'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
