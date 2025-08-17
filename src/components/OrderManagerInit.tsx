"use client";

import { useEffect } from "react";
import { OrderManager } from "@/utils/orderManager";

/**
 * Componente para inicializar el OrderManager y funciones de utilidad
 */
export default function OrderManagerInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Exponer OrderManager globalmente para debugging
      (window as any).OrderManager = OrderManager;
      
      // Limpiar pedidos duplicados al iniciar
      const stats = OrderManager.getOrderStats();
      if (stats.total > 0) {
        OrderManager.cleanupOrders();
        console.log('🧹 OrderManager inicializado. Pedidos limpiados:', stats.total);
      }
    }
  }, []);

  return null; // Este componente no renderiza nada
}
