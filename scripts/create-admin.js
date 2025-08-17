const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si ya existe un usuario admin
    const existingUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingUser) {
      console.log('✅ Ya existe un usuario administrador:', existingUser.email);
      return;
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@tienda.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email: admin@tienda.com');
    console.log('🔑 Contraseña: admin123');
    console.log('👤 ID:', adminUser.id);

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
