const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBasicCategories() {
  try {
    console.log('🔄 Creando categorías básicas...');
    
    const basicCategories = [
      { name: 'Abarrotes', description: 'Productos básicos de despensa' },
      { name: 'Venezolanos', description: 'Productos tradicionales venezolanos' },
      { name: 'Harinas', description: 'Harinas y productos para hornear' },
      { name: 'Lácteos', description: 'Productos lácteos y derivados' },
      { name: 'Bebidas', description: 'Bebidas y refrescos' },
    ];

    for (const category of basicCategories) {
      const slug = category.name.toLowerCase().replace(/\s+/g, '-');
      
      // Verificar si ya existe
      const existing = await prisma.category.findUnique({
        where: { slug }
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            name: category.name,
            slug,
            description: category.description,
            isActive: true,
          }
        });
        console.log(`✅ Categoría creada: ${category.name}`);
      } else {
        console.log(`⏭️ Ya existe: ${category.name}`);
      }
    }

    console.log('✅ Categorías básicas creadas exitosamente');
    console.log('📝 Ahora puedes ir a http://localhost:3000/admin/productos');
    
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBasicCategories();
