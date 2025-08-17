"use client";

import { useState, useEffect } from "react";
import { OrderManager } from "@/utils/orderManager";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";

export default function OrderDiagnostics() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const orderStats = OrderManager.getOrderStats();
      const orders = OrderManager.getAllOrders();
      
      setStats({
        ...orderStats,
        orders: orders.slice(0, 5), // Solo mostrar primeros 5
        totalOrders: orders.length
      });
      
      showToast('Diagnóstico completado', 'success');
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      showToast('Error en diagnóstico', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrders = async () => {
    try {
      const result = OrderManager.cleanupOrders();
      if (result) {
        showToast('Pedidos limpiados correctamente', 'success');
        runDiagnostics(); // Recargar stats
      }
    } catch (error) {
      showToast('Error al limpiar pedidos', 'error');
    }
  };

  const createTestOrder = async () => {
    try {
      const testOrder = OrderManager.createOrder({
        items: [
          {
            id: 'test-product-diagnostic',
            name: 'Producto de Diagnóstico',
            price: 15.99,
            quantity: 1,
            image: '/file.svg'
          }
        ],
        customer: 'Cliente de Diagnóstico',
        email: 'diagnostico@example.com',
        paymentMethod: 'Test',
        shippingCost: 5.00
      });
      
      showToast(`Pedido de prueba creado: ${testOrder.id}`, 'success');
      runDiagnostics(); // Recargar stats
    } catch (error) {
      showToast('Error al crear pedido de prueba', 'error');
    }
  };

  useEffect(() => {
    if (isOpen && !stats) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          🔧 Diagnóstico
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">Diagnóstico de Pedidos</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Ejecutando diagnóstico...</p>
        </div>
      ) : stats ? (
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-sm mb-2">📊 Estadísticas</h4>
            <div className="text-xs space-y-1">
              <p>Total: {stats.total}</p>
              <p>En proceso: {stats.enProceso}</p>
              <p>Completados: {stats.completado}</p>
              <p>Ventas totales: ${stats.totalVentas.toFixed(2)}</p>
            </div>
          </div>

          {stats.orders.length > 0 && (
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-sm mb-2">📋 Últimos pedidos</h4>
              <div className="text-xs space-y-1">
                {stats.orders.map((order: any) => (
                  <p key={order.id}>
                    {order.id} - {order.status} - ${order.total.toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={runDiagnostics}
              size="sm"
              variant="outline"
              disabled={loading}
            >
              🔄 Actualizar
            </Button>
            <Button
              onClick={cleanupOrders}
              size="sm"
              variant="outline"
            >
              🧹 Limpiar
            </Button>
            <Button
              onClick={createTestOrder}
              size="sm"
              variant="outline"
            >
              🧪 Test
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Sin datos de diagnóstico</p>
          <Button onClick={runDiagnostics} size="sm" className="mt-2">
            Ejecutar diagnóstico
          </Button>
        </div>
      )}
    </div>
  );
}
