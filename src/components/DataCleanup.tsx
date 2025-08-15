"use client";

import { useEffect } from "react";

export default function DataCleanup() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      console.log('🧹 Iniciando limpieza de datos corruptos...');
      
      // Limpiar carrito corrupto
      try {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const parsedCart = JSON.parse(cart);
          if (Array.isArray(parsedCart)) {
            const hasCorruptedData = parsedCart.some(item => 
              item && typeof item === 'object' && item.title
            );
            if (hasCorruptedData) {
              console.log('🔄 Carrito corrupto detectado, limpiando...');
              localStorage.removeItem('cart');
              localStorage.removeItem('cartItems');
            }
          }
        }
      } catch (error) {
        console.log('❌ Error al verificar carrito, limpiando...');
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
      }

      // Verificar y limpiar otros datos si es necesario
      try {
        const orders = localStorage.getItem('orders');
        if (orders) {
          const parsedOrders = JSON.parse(orders);
          if (!Array.isArray(parsedOrders)) {
            console.log('🔄 Datos de pedidos inválidos, limpiando...');
            localStorage.removeItem('orders');
          }
        }
      } catch (error) {
        console.log('❌ Error al verificar pedidos, limpiando...');
        localStorage.removeItem('orders');
      }

      try {
        const addresses = localStorage.getItem('addresses');
        if (addresses) {
          const parsedAddresses = JSON.parse(addresses);
          if (!Array.isArray(parsedAddresses)) {
            console.log('🔄 Datos de direcciones inválidos, limpiando...');
            localStorage.removeItem('addresses');
          }
        }
      } catch (error) {
        console.log('❌ Error al verificar direcciones, limpiando...');
        localStorage.removeItem('addresses');
      }

      console.log('✅ Limpieza de datos completada');
    }
  }, []);

  return null; // Este componente no renderiza nada
}
