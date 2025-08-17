const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Iniciando limpieza de la base de datos...');
    
    // Eliminar en orden correcto debido a las relaciones
    console.log('📦 Eliminando items de carrito...');
    await prisma.cartItem.deleteMany({});
    
    console.log('🛒 Eliminando carritos...');
    await prisma.cart.deleteMany({});
    
    console.log('📋 Eliminando items de órdenes...');
    await prisma.orderItem.deleteMany({});
    
    console.log('🧾 Eliminando órdenes...');
    await prisma.order.deleteMany({});
    
    console.log('🔗 Eliminando relaciones producto-categoría...');
    await prisma.productCategory.deleteMany({});
    
    console.log('📦 Eliminando productos...');
    await prisma.product.deleteMany({});
    
    console.log('🏷️ Eliminando categorías...');
    await prisma.category.deleteMany({});
    
    console.log('✅ Base de datos limpiada completamente');
    console.log('📝 Ahora puedes usar la carga masiva para subir todos tus productos y categorías');
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
