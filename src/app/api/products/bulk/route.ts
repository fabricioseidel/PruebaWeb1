import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

// Función helper para normalizar slugs
const normalizeSlug = (value: string) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

// POST /api/products/bulk
export async function POST(req: Request) {
  // Solo admins pueden hacer carga masiva
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { products } = await req.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de productos' }, { status: 400 });
    }

    const results = {
      success: 0,
      errors: [] as string[],
      createdCategories: [] as string[],
      skipped: 0,
    };

    // Obtener todas las categorías existentes de una vez
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map(existingCategories.map(cat => [cat.name.toLowerCase(), cat]));
    
    // Obtener productos existentes para evitar duplicados
    const existingProducts = await prisma.product.findMany({
      select: { slug: true, name: true }
    });
    const existingSlugs = new Set(existingProducts.map(p => p.slug));
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));

    // Procesar productos en lotes más eficientes
    for (const productData of products) {
      try {
        const { categories = [], ...productInfo } = productData;
        
        // Validar datos básicos
        if (!productInfo.name || !productInfo.price) {
          results.errors.push(`Producto sin nombre o precio: ${productInfo.name || 'Sin nombre'}`);
          continue;
        }

        // Crear slug si no existe
        const slug = productInfo.slug || normalizeSlug(productInfo.name);
        
        // Verificar duplicados
        if (existingSlugs.has(slug) || existingNames.has(productInfo.name.toLowerCase())) {
          results.skipped++;
          continue;
        }

        // Crear producto
        const product = await prisma.product.create({
          data: {
            name: productInfo.name,
            description: productInfo.description || '',
            price: parseFloat(productInfo.price),
            stock: parseInt(productInfo.stock) || 0,
            slug,
            images: productInfo.image || '/images/products/default.jpg',
            featured: false,
          }
        });

        // Actualizar sets para evitar futuros duplicados
        existingSlugs.add(slug);
        existingNames.add(productInfo.name.toLowerCase());

        // Procesar categorías si existen
        if (Array.isArray(categories) && categories.length > 0) {
          for (const categoryName of categories) {
            if (!categoryName || typeof categoryName !== 'string') continue;
            
            const trimmedName = categoryName.trim();
            const categoryKey = trimmedName.toLowerCase();
            
            let category = categoryMap.get(categoryKey);
            
            // Crear categoría si no existe
            if (!category) {
              const categorySlug = normalizeSlug(trimmedName);
              category = await prisma.category.create({
                data: {
                  name: trimmedName,
                  slug: categorySlug,
                  description: `Productos de ${trimmedName}`,
                  isActive: true,
                }
              });
              categoryMap.set(categoryKey, category);
              results.createdCategories.push(trimmedName);
            }
            
            // Crear relación producto-categoría
            await prisma.productCategory.create({
              data: {
                productId: product.id,
                categoryId: category.id,
              }
            });
          }
        }
        
        results.success++;
      } catch (error) {
        console.error('Error procesando producto:', error);
        results.errors.push(`Error en producto ${productData.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return NextResponse.json({
      message: `Procesamiento completado: ${results.success} productos creados, ${results.skipped} omitidos`,
      ...results
    }, { status: 200 });

  } catch (error) {
    console.error('Error en carga masiva:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
