"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  CheckIcon,
  TruckIcon,
  XMarkIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

// Tipo para los productos del pedido
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// Tipo para el detalle del pedido
type OrderDetail = {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  payment: {
    method: string;
    transactionId: string;
    status: string;
  };
  items: OrderItem[];
  status: string;
  subtotal: number;
  shippingCost: number;
  taxes: number;
  total: number;
  notes: string;
};

// Estados posibles del pedido
const orderStatuses = [
  { id: "PENDING", name: "Pendiente", icon: ClockIcon, color: "text-yellow-500" },
  { id: "PROCESSING", name: "Procesando", icon: ClockIcon, color: "text-blue-500" },
  { id: "SHIPPED", name: "Enviado", icon: TruckIcon, color: "text-purple-500" },
  { id: "DELIVERED", name: "Entregado", icon: CheckIcon, color: "text-green-500" },
  { id: "CANCELLED", name: "Cancelado", icon: XMarkIcon, color: "text-red-500" }
];

// Eliminado mock: se cargará desde localStorage

// Componente para mostrar el estado del pedido
function OrderStatusBadge({ status }: { status: string }) {
  let bgColor = "";
  let textColor = "";
  
  switch (status) {
    case "Pendiente":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "Procesando":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
    case "Enviado":
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      break;
    case "Completado":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "Cancelado":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
  }
  
  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}

// Componente principal para la página de detalle de pedido
export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  
  // Cargar pedido real desde localStorage 'orders'
  useEffect(() => {
    try {
      const raw = localStorage.getItem('orders');
      if (!raw) {
        setLoading(false);
        return;
      }
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) {
        setLoading(false);
        return;
      }
      const found = arr.find((o: any) => o.id === id);
      if (!found) {
        setLoading(false);
        return;
      }
      // Normalizar estructura proveniente del checkout
      const date = (found.date || found.fecha || new Date().toISOString()).toString();
  const itemsArray = Array.isArray(found.items) ? found.items : [];
  const addr = found.shippingAddress || {};
      const items: OrderItem[] = itemsArray.map((it: any, idx: number) => ({
        id: it.id?.toString() || `ITEM-${idx}`,
        name: it.name || it.title || `Producto ${idx+1}`,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        image: it.image || '/file.svg'
      }));
      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const shippingCost = 10; // mismo criterio que checkout
      const taxes = subtotal * 0.19; // ejemplo IVA 19%
      const total = subtotal + shippingCost; // ignoramos taxes en total manteniendo compatibilidad con checkout
      const detail: OrderDetail = {
        id: found.id,
        date: date.length > 10 ? date : `${date} 00:00:00`,
        customer: {
          name: found.customer || found.cliente || addr.nombre || '-',
          email: found.email || found.correo || '-',
          phone: addr.telefono || found.phone || '+00 000 0000'
        },
        shipping: {
          address: addr.calle ? `${addr.calle} ${addr.numero || ''}${addr.interior ? ' Int. '+addr.interior : ''}`.trim() : (found.address || 'Dirección no especificada'),
          city: addr.ciudad || found.city || '-',
          postalCode: addr.codigoPostal || found.postalCode || '-',
          country: addr.estado || found.country || '-'
        },
        payment: {
          method: found.paymentMethod || 'No especificado',
          transactionId: found.transactionId || 'LOCAL-' + found.id,
          status: 'Aprobado'
        },
        status: found.status || found.estado || 'En proceso',
        items,
        subtotal,
        shippingCost,
        taxes,
        total,
        notes: found.notes || ''
      };
      setOrder(detail);
      setNewStatus(detail.status);
    } catch (e) {
      console.error('Error cargando pedido', e);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  // Manejar cambio de estado
  const handleStatusChange = async () => {
    if (order && newStatus !== order.status) {
      try {
        setSaving(true);
        await new Promise(r => setTimeout(r, 200));
        setOrder({
          ...order,
          status: newStatus
        });
        // Persistir en lista 'orders'
        try {
          const raw = localStorage.getItem('orders');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const updated = list.map((o: any) => o.id === order.id ? { ...o, status: newStatus } : o);
              localStorage.setItem('orders', JSON.stringify(updated));
            }
          }
        } catch {}
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
      } finally {
        // Desactivar estado de guardado
        setSaving(false);
      }
    }
  };
  
  // Manejar la impresión de la factura
  const handlePrintInvoice = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Pedido no encontrado</h2>
        <p className="mt-2 text-gray-600">El pedido que buscas no existe o ha sido eliminado.</p>
        <div className="mt-6">
          <Link href="/admin/pedidos">
            <Button>
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver a pedidos
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-12">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin/pedidos" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Volver a pedidos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Pedido {order.id}
          </h1>
          <p className="text-sm text-gray-500">
            Realizado el {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <PrinterIcon className="h-5 w-5 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Generar factura
          </Button>
        </div>
      </div>
      
      {/* Resumen y estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
              <p className="mt-1 text-sm text-gray-900">{order.customer.name}</p>
              <p className="mt-1 text-sm text-gray-900">{order.customer.email}</p>
              <p className="mt-1 text-sm text-gray-900">{order.customer.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dirección de envío</h3>
              <p className="mt-1 text-sm text-gray-900">{order.shipping.address}</p>
              <p className="mt-1 text-sm text-gray-900">{order.shipping.city}, {order.shipping.postalCode}</p>
              <p className="mt-1 text-sm text-gray-900">{order.shipping.country}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Método de pago</h3>
              <div className="mt-1 flex items-center">
                <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{order.payment.method}</span>
              </div>
              <p className="mt-1 text-sm text-gray-900">Transacción: {order.payment.transactionId}</p>
              <p className="mt-1 text-sm text-gray-900">Estado: {order.payment.status}</p>
            </div>
            {order.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notas</h3>
                <p className="mt-1 text-sm text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado del pedido</h2>
          <div className="mb-4">
            <OrderStatusBadge status={order.status} />
          </div>
          
          <div className="mb-6">
            <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-2">
              Actualizar estado
            </label>
            <select
              id="orderStatus"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Procesando">Procesando</option>
              <option value="Enviado">Enviado</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          
          <Button 
            onClick={handleStatusChange} 
            disabled={newStatus === order.status || saving}
            className="w-full"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </>
            ) : (
              'Actualizar estado'
            )}
          </Button>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Historial de eventos</h3>
            <div className="space-y-4">
              <div className="flex items-start text-xs text-gray-500">Historial no disponible (local)</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Productos del pedido */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget;
                            // Evitar bucle infinito: solo aplicar fallback una vez
                            if (!img.dataset.fallback) {
                              img.dataset.fallback = '1';
                              img.src = '/file.svg'; // recurso existente en public
                            }
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Resumen de costos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Resumen de costos</h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Envío</span>
            <span className="text-sm font-medium text-gray-900">${order.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Impuestos</span>
            <span className="text-sm font-medium text-gray-900">${order.taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
