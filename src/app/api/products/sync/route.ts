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

// POST /api/products/sync
// Este endpoint sincroniza productos del localStorage con la base de datos
export async function POST(req: Request) {
  // Solo admins pueden sincronizar
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
      synced: 0,
      errors: [] as string[],
      createdCategories: [] as string[],
      skipped: 0,
    };

    for (const productData of products) {
      try {
        const { categories = [], ...productInfo } = productData;
        
        // Verificar si el producto ya existe en la BD
        const existingProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { slug: productInfo.slug },
              { name: productInfo.name }
            ]
          }
        });
        
        if (existingProduct) {
          results.skipped++;
          continue;
        }

        // Crear producto en la BD
        const product = await prisma.product.create({
          data: {
            name: productInfo.name,
            description: productInfo.description || '',
            price: parseFloat(productInfo.price),
            stock: parseInt(productInfo.stock) || 0,
            slug: productInfo.slug || normalizeSlug(productInfo.name),
            images: productInfo.image || '/images/products/default.jpg',
            featured: productInfo.featured || false,
          }
        });

        // Procesar categorías
        if (Array.isArray(categories) && categories.length > 0) {
          for (const categoryName of categories) {
            if (!categoryName || typeof categoryName !== 'string') continue;
            
            const trimmedName = categoryName.trim();
            const categorySlug = normalizeSlug(trimmedName);
            
            // Crear categoría si no existe
            let category = await prisma.category.findFirst({
              where: {
                OR: [
                  { name: trimmedName },
                  { slug: categorySlug }
                ]
              }
            });
            
            if (!category) {
              category = await prisma.category.create({
                data: {
                  name: trimmedName,
                  slug: categorySlug,
                  description: `Productos de ${trimmedName}`,
                  isActive: true,
                }
              });
              results.createdCategories.push(trimmedName);
            }
            
            // Crear relación producto-categoría si no existe
            const existingRelation = await prisma.productCategory.findFirst({
              where: {
                productId: product.id,
                categoryId: category.id,
              }
            });
            
            if (!existingRelation) {
              await prisma.productCategory.create({
                data: {
                  productId: product.id,
                  categoryId: category.id,
                }
              });
            }
          }
        }
        
        results.synced++;
      } catch (error) {
        console.error('Error sincronizando producto:', error);
        results.errors.push(`Error en producto ${productData.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return NextResponse.json({
      message: `Sincronización completada: ${results.synced} productos sincronizados, ${results.skipped} omitidos`,
      ...results
    }, { status: 200 });

  } catch (error) {
    console.error('Error en sincronización:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
