// prisma/seed.js
/**
 * Prisma seed para productos base (OlivoMarket).
 * Adaptado al schema existente con Product/Category many-to-many.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Categorías base
const categories = [
  { name: 'Abarrotes', slug: 'abarrotes', description: 'Productos básicos de despensa' },
  { name: 'Congelados', slug: 'congelados', description: 'Productos congelados y helados' },
  { name: 'Panadería', slug: 'panaderia', description: 'Pan fresco y productos de panadería' },
  { name: 'Quesos', slug: 'quesos', description: 'Quesos artesanales y tradicionales' },
  { name: 'Bebidas', slug: 'bebidas', description: 'Refrescos y bebidas' },
  { name: 'Agua', slug: 'agua', description: 'Agua mineral y con gas' },
  { name: 'Hielo', slug: 'hielo', description: 'Hielo para bebidas y conservación' },
  { name: 'Café', slug: 'cafe', description: 'Café en grano y molido' },
  { name: 'Postres', slug: 'postres', description: 'Dulces y postres tradicionales' }
];

// Productos base OlivoMarket (adaptado al schema existente)
const products = [
  { 
    name: 'Harina PAN Blanca 1kg', 
    slug: 'harina-pan-blanca-1kg',
    description: 'Harina de maíz precocida marca PAN, ideal para arepas y empanadas',
    price: 2000, 
    stock: 30, 
    images: '/images/products/harina-pan-blanca.jpg',
    categorySlug: 'abarrotes'
  },
  { 
    name: 'Harina PAN Amarilla 1kg', 
    slug: 'harina-pan-amarilla-1kg',
    description: 'Harina de maíz amarillo precocida, sabor tradicional venezolano',
    price: 2000, 
    stock: 25, 
    images: '/images/products/harina-pan-amarilla.jpg',
    categorySlug: 'abarrotes'
  },
  { 
    name: 'Tequeños de Queso (10u)', 
    slug: 'tequenos-queso-10u',
    description: 'Tequeños venezolanos rellenos de queso, listos para freír',
    price: 4500, 
    stock: 20, 
    images: '/images/products/tequenos-queso.jpg',
    categorySlug: 'congelados'
  },
  { 
    name: 'Marraqueta (4u)', 
    slug: 'marraqueta-4u',
    description: 'Pan marraqueta chileno tradicional, crujiente por fuera',
    price: 1200, 
    stock: 15, 
    images: '/images/products/marraqueta.jpg',
    categorySlug: 'panaderia'
  },
  { 
    name: 'Pan de Hamburguesa (6u)', 
    slug: 'pan-hamburguesa-6u',
    description: 'Pan especial para hamburguesas, suave y esponjoso',
    price: 1500, 
    stock: 12, 
    images: '/images/products/pan-hamburguesa.jpg',
    categorySlug: 'panaderia'
  },
  { 
    name: 'Queso Llanero 250g', 
    slug: 'queso-llanero-250g',
    description: 'Queso venezolano tradicional de los llanos, cremoso y salado',
    price: 4500, 
    stock: 10, 
    images: '/images/products/queso-llanero.jpg',
    categorySlug: 'quesos'
  },
  { 
    name: 'Queso de Mano 250g', 
    slug: 'queso-mano-250g',
    description: 'Queso artesanal venezolano, suave y de sabor único',
    price: 5000, 
    stock: 10, 
    images: '/images/products/queso-mano.jpg',
    categorySlug: 'quesos'
  },
  { 
    name: 'Queso Gauda 250g', 
    slug: 'queso-gauda-250g',
    description: 'Queso Gouda holandés, cremoso y de sabor intenso',
    price: 3800, 
    stock: 14, 
    images: '/images/products/queso-gauda.jpg',
    categorySlug: 'quesos'
  },
  { 
    name: 'Coca-Cola 2L', 
    slug: 'coca-cola-2l',
    description: 'Bebida gaseosa Coca-Cola formato familiar 2 litros',
    price: 1800, 
    stock: 40, 
    images: '/images/products/coca-cola-2l.jpg',
    categorySlug: 'bebidas'
  },
  { 
    name: 'Sprite 1.5L', 
    slug: 'sprite-1-5l',
    description: 'Bebida refrescante de limón Sprite, botella 1.5L',
    price: 1500, 
    stock: 36, 
    images: '/images/products/sprite-1-5l.jpg',
    categorySlug: 'bebidas'
  },
  { 
    name: 'Fanta 1.5L', 
    slug: 'fanta-1-5l',
    description: 'Bebida sabor naranja Fanta, refrescante botella 1.5L',
    price: 1500, 
    stock: 36, 
    images: '/images/products/fanta-1-5l.jpg',
    categorySlug: 'bebidas'
  },
  { 
    name: 'Agua Benedictino 2L (sin gas)', 
    slug: 'agua-benedictino-2l',
    description: 'Agua mineral natural Benedictino, sin gas, 2 litros',
    price: 1100, 
    stock: 30, 
    images: '/images/products/agua-benedictino.jpg',
    categorySlug: 'agua'
  },
  { 
    name: 'Bolsa de Hielo 2kg', 
    slug: 'hielo-2kg',
    description: 'Hielo en cubos para bebidas y conservación, bolsa 2kg',
    price: 1200, 
    stock: 22, 
    images: '/images/products/hielo-2kg.jpg',
    categorySlug: 'hielo'
  },
  { 
    name: 'Café Molido 250g', 
    slug: 'cafe-molido-250g',
    description: 'Café colombiano molido premium, aroma intenso',
    price: 3500, 
    stock: 18, 
    images: '/images/products/cafe-molido.jpg',
    categorySlug: 'cafe'
  },
  { 
    name: 'Alfajor Individual', 
    slug: 'alfajor-individual',
    description: 'Alfajor argentino relleno de dulce de leche y coco',
    price: 900, 
    stock: 24, 
    images: '/images/products/alfajor.jpg',
    categorySlug: 'postres'
  }
];

async function main() {
  console.log('🌱 Seeding OlivoMarket...');
  
  // Crear categorías
  console.log('📁 Creando categorías...');
  const createdCategories = {};
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    createdCategories[cat.slug] = category;
    console.log('✔ Categoría:', cat.name);
  }
  
  // Crear productos y relaciones
  console.log('🛒 Creando productos...');
  for (const p of products) {
    const { categorySlug, ...productData } = p;
    
    // Crear producto
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productData,
      create: productData,
    });
    
    // Crear relación con categoría
    const category = createdCategories[categorySlug];
    if (category) {
      await prisma.productCategory.upsert({
        where: { 
          productId_categoryId: {
            productId: product.id,
            categoryId: category.id
          }
        },
        update: {},
        create: {
          productId: product.id,
          categoryId: category.id
        }
      });
    }
    
    console.log('✔ Producto:', p.name);
  }
  
  console.log('✅ Seed completado! Productos OlivoMarket listos.');
  console.log(`📦 ${categories.length} categorías y ${products.length} productos creados.`);
}

main()
  .catch(e => { 
    console.error('❌ Seed error:', e); 
    process.exit(1); 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  });
