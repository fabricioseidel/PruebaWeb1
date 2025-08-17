/**
 * Script para restaurar datos de ejemplo en localStorage
 * Ejecutar en la consola del navegador para restaurar datos perdidos
 */

import { OrderManager } from './orderManager';

export const restoreDefaultData = () => {
  // Datos de perfil por defecto
  const defaultProfile = {
    nombre: "Juan",
    apellidos: "Pérez González",
    email: "juan.perez@example.com",
    telefono: "555-123-4567"
  };

  // Pedidos de ejemplo usando la nueva estructura
  const defaultOrders = [
    {
      id: "ORD-1723456789-123456",
      date: "2025-08-15",
      createdAt: "2025-08-15T10:30:00.000Z",
      total: 129.99,
      subtotal: 119.99,
      shippingCost: 10.00,
      status: "Completado",
      customer: "Juan Pérez González",
      email: "juan.perez@example.com",
      items: [
        {
          id: "harina-pan-1kg",
          name: "Harina P.A.N. 1kg",
          price: 45.99,
          quantity: 2,
          image: "/productos/harina-pan.jpg"
        },
        {
          id: "malta-polar-330ml",
          name: "Maltín Polar 330ml",
          price: 38.01,
          quantity: 1,
          image: "/productos/malta-polar.jpg"
        }
      ],
      paymentMethod: "Tarjeta de Crédito",
      transactionId: "TXN-1723456789",
      shippingAddress: {
        nombre: "Juan Pérez González",
        calle: "Av. Insurgentes Sur",
        numero: "1234",
        interior: "Apt 5B",
        ciudad: "Caracas",
        estado: "Distrito Capital",
        codigoPostal: "1060",
        telefono: "555-123-4567"
      }
    },
    {
      id: "ORD-1723356789-789123",
      date: "2025-08-14",
      createdAt: "2025-08-14T15:20:00.000Z",
      total: 89.50,
      subtotal: 79.50,
      shippingCost: 10.00,
      status: "En proceso",
      customer: "María García",
      email: "maria.garcia@example.com",
      items: [
        {
          id: "queso-llanero-500g",
          name: "Queso Llanero 500g",
          price: 79.50,
          quantity: 1,
          image: "/productos/queso-llanero.jpg"
        }
      ],
      paymentMethod: "Transferencia Bancaria",
      transactionId: "TXN-1723356789"
    },
    {
      id: "ORD-1723256789-456789",
      date: "2025-08-13",
      createdAt: "2025-08-13T09:15:00.000Z",
      total: 199.99,
      subtotal: 189.99,
      shippingCost: 10.00,
      status: "Enviado",
      customer: "Carlos Rodríguez",
      email: "carlos.rodriguez@example.com",
      items: [
        {
          id: "cachito-jamon-queso",
          name: "Cachitos de Jamón y Queso (6 unidades)",
          price: 65.00,
          quantity: 2,
          image: "/productos/cachitos.jpg"
        },
        {
          id: "golfeados-dulce-papelón",
          name: "Golfeados con Dulce de Papelón (4 unidades)",
          price: 59.99,
          quantity: 1,
          image: "/productos/golfeados.jpg"
        }
      ],
      paymentMethod: "Tarjeta de Débito",
      transactionId: "TXN-1723256789"
    }
  ];

  // Direcciones de ejemplo
  const defaultAddresses = [
    {
      id: "addr-001",
      nombre: "Casa",
      calle: "Av. Insurgentes Sur",
      numero: "1234",
      interior: "Apt 5B",
      colonia: "Roma Norte",
      ciudad: "Caracas",
      estado: "Distrito Capital",
      codigoPostal: "1060",
      telefono: "555-123-4567",
      predeterminada: true
    },
    {
      id: "addr-002",
      nombre: "Oficina",
      calle: "Av. Francisco de Miranda",
      numero: "567",
      interior: "Piso 10",
      colonia: "Los Palos Grandes",
      ciudad: "Caracas",
      estado: "Distrito Capital",
      codigoPostal: "1062",
      telefono: "555-987-6543",
      predeterminada: false
    }
  ];

  try {
    // Restaurar datos en localStorage
    localStorage.setItem('profile', JSON.stringify(defaultProfile));
    localStorage.setItem('orders', JSON.stringify(defaultOrders));
    localStorage.setItem('addresses', JSON.stringify(defaultAddresses));
    
    // Limpiar y normalizar pedidos existentes
    OrderManager.cleanupOrders();
    
    console.log('✅ Datos restaurados exitosamente:');
    console.log('- Perfil de usuario actualizado');
    console.log('- Pedidos de ejemplo agregados con estructura nueva');
    console.log('- Direcciones de ejemplo agregadas');
    console.log('- Datos de pedidos limpiados y normalizados');
    console.log('Recarga la página para ver los cambios.');
    
    return true;
  } catch (error) {
    console.error('❌ Error al restaurar datos:', error);
    return false;
  }
};

// Función para diagnosticar problemas con pedidos
export const diagnoseOrderIssues = () => {
  console.log('🔍 Diagnóstico de pedidos:');
  
  try {
    const orders = OrderManager.getAllOrders();
    const stats = OrderManager.getOrderStats();
    
    console.log('📊 Estadísticas:');
    console.table(stats);
    
    console.log('📋 Pedidos encontrados:');
    if (orders.length === 0) {
      console.log('❌ No se encontraron pedidos');
    } else {
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.id} - ${order.status} - $${order.total} (${order.items.length} items)`);
      });
    }
    
    // Verificar localStorage
    const rawOrders = localStorage.getItem('orders');
    console.log('💾 Datos brutos en localStorage:', rawOrders ? JSON.parse(rawOrders).length + ' registros' : 'No hay datos');
    
    return { orders, stats, hasIssues: orders.length === 0 };
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return { orders: [], stats: null, hasIssues: true, error };
  }
};

// Función para crear un pedido de prueba
export const createTestOrder = () => {
  console.log('🧪 Creando pedido de prueba...');
  
  try {
    const testOrder = OrderManager.createOrder({
      items: [
        {
          id: 'test-product-1',
          name: 'Producto de Prueba',
          price: 25.99,
          quantity: 2,
          image: '/file.svg'
        }
      ],
      customer: 'Cliente de Prueba',
      email: 'test@example.com',
      paymentMethod: 'Prueba',
      shippingCost: 10.00
    });
    
    console.log('✅ Pedido de prueba creado:', testOrder.id);
    return testOrder;
  } catch (error) {
    console.error('❌ Error al crear pedido de prueba:', error);
    return null;
  }
};

// Función para limpiar todos los datos
export const clearAllData = () => {
  try {
    localStorage.removeItem('profile');
    localStorage.removeItem('orders');
    localStorage.removeItem('addresses');
    localStorage.removeItem('cart');
    localStorage.removeItem('cartItems');
    
    console.log('🧹 Todos los datos han sido limpiados del localStorage');
    console.log('Recarga la página para ver los cambios.');
    
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
    return false;
  }
};

// Agregar funciones al objeto global para uso en consola
declare global {
  interface Window {
    restoreDefaultData?: () => boolean;
    clearAllData?: () => boolean;
    diagnoseOrderIssues?: () => any;
    createTestOrder?: () => any;
    OrderManager?: typeof OrderManager;
  }

  // Ensure this file is treated as a module
  // (prevents duplicate identifier errors in some TS configs)
  const __dummy_restore: unknown;
}

if (typeof window !== 'undefined') {
  window.restoreDefaultData = restoreDefaultData;
  window.clearAllData = clearAllData;
  window.diagnoseOrderIssues = diagnoseOrderIssues;
  window.createTestOrder = createTestOrder;
  window.OrderManager = OrderManager;
}

// Instrucciones para usar en consola
console.log(`
🔧 Funciones de utilidad disponibles en la consola:

• restoreDefaultData() - Restaura datos de ejemplo con estructura nueva
• clearAllData() - Limpia todos los datos guardados
• diagnoseOrderIssues() - Diagnostica problemas con pedidos
• createTestOrder() - Crea un pedido de prueba
• OrderManager - Gestor centralizado de pedidos

Ejemplos de uso:
> restoreDefaultData()
> location.reload()

> diagnoseOrderIssues()
> createTestOrder()

Métodos del OrderManager:
> OrderManager.getAllOrders()
> OrderManager.getOrderStats()
> OrderManager.cleanupOrders()
`);
