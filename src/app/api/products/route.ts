import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener productos con sus categorías
    const products = await prisma.product.findMany({
      include: {
        productCategories: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Función auxiliar para parsear imágenes de forma segura
    const safeParseImages = (images: string | null): string[] => {
      if (!images) return ['/file.svg'];
      
      try {
        // Si ya es un array JSON válido
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Si no es JSON válido, tratarlo como una URL simple
        return [images];
      }
    };

    // Transformar los datos para que coincidan con el formato esperado
    const formattedProducts = products.map(product => {
      const parsedImages = safeParseImages(product.images);
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        slug: product.slug,
        image: parsedImages[0] || '/file.svg',
        images: parsedImages,
        categories: product.productCategories.map(pc => pc.category.name),
        featured: product.featured,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
