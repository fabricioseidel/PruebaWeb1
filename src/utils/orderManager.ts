/**
 * Gestor centralizado de pedidos para evitar inconsistencias
 */

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
}

export interface OrderAddress {
  nombre?: string;
  calle?: string;
  numero?: string;
  interior?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  telefono?: string;
}

export interface Order {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  total: number;
  subtotal: number;
  shippingCost: number;
  status: string;
  customer?: string;
  email?: string;
  userId?: string;
  items: OrderItem[];
  shippingAddress?: OrderAddress;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export class OrderManager {
  private static readonly STORAGE_KEY = 'orders';
  private static readonly MAX_ORDERS = 1000; // Límite para evitar problemas de storage

  /**
   * Genera un ID único para un pedido
   */
  static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Obtiene todos los pedidos del localStorage
   */
  static getAllOrders(): Order[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(this.normalizeOrder).filter((order): order is Order => order !== null);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
  }

  /**
   * Obtiene un pedido específico por ID
   */
  static getOrderById(id: string): Order | null {
    const orders = this.getAllOrders();
    return orders.find(order => order.id === id) || null;
  }

  /**
   * Crea un nuevo pedido
   */
  static createOrder(orderData: {
    items: OrderItem[];
    customer?: string;
    email?: string;
    userId?: string;
    shippingAddress?: OrderAddress;
    paymentMethod?: string;
    shippingCost?: number;
    notes?: string;
  }): Order {
    const now = new Date();
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = orderData.shippingCost || 10.00;
    const total = subtotal + shippingCost;

    const newOrder: Order = {
      id: this.generateOrderId(),
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      total,
      subtotal,
      shippingCost,
      status: 'En proceso',
      customer: orderData.customer || 'Invitado',
      email: orderData.email,
      userId: orderData.userId,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      transactionId: `TXN-${Date.now()}`,
      notes: orderData.notes || ''
    };

    this.saveOrder(newOrder);
    return newOrder;
  }

  /**
   * Guarda un pedido nuevo en localStorage
   */
  static saveOrder(order: Order): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const orders = this.getAllOrders();
      
      // Verificar si ya existe un pedido con el mismo ID
      if (orders.some(existingOrder => existingOrder.id === order.id)) {
        console.warn(`Pedido con ID ${order.id} ya existe`);
        return false;
      }

      // Agregar el nuevo pedido al inicio de la lista
      const updatedOrders = [order, ...orders].slice(0, this.MAX_ORDERS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedOrders));
      
      console.log(`✅ Pedido ${order.id} guardado exitosamente`);
      return true;
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      return false;
    }
  }

  /**
   * Actualiza el estado de un pedido
   */
  static updateOrderStatus(orderId: string, newStatus: string): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const orders = this.getAllOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        console.warn(`Pedido con ID ${orderId} no encontrado`);
        return false;
      }

      orders[orderIndex].status = newStatus;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
      
      console.log(`✅ Estado del pedido ${orderId} actualizado a: ${newStatus}`);
      return true;
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      return false;
    }
  }

  /**
   * Normaliza la estructura de un pedido para compatibilidad
   */
  private static normalizeOrder(rawOrder: any): Order | null {
    try {
      if (!rawOrder || typeof rawOrder !== 'object') return null;

      // Extraer campos con diferentes nombres posibles
      const id = rawOrder.id?.toString() || `ORD-LEGACY-${Date.now()}`;
      const date = (rawOrder.date || rawOrder.fecha || new Date().toISOString().split('T')[0]).toString();
      const createdAt = rawOrder.createdAt || rawOrder.fecha || new Date().toISOString();
      const status = (rawOrder.status || rawOrder.estado || 'En proceso').toString();
      const total = Number(rawOrder.total) || 0;
      const subtotal = Number(rawOrder.subtotal) || total - 10; // Asumir shipping = 10 si no existe
      const shippingCost = Number(rawOrder.shippingCost) || 10;

      // Normalizar items
      let items: OrderItem[] = [];
      if (Array.isArray(rawOrder.items)) {
        items = rawOrder.items.map((item: any, index: number) => ({
          id: item.id?.toString() || `ITEM-${index}`,
          name: item.name || item.title || `Producto ${index + 1}`,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || '/file.svg',
          slug: item.slug || ''
        }));
      }

      const normalizedOrder: Order = {
        id,
        date: date.length > 10 ? date.split('T')[0] : date,
        createdAt,
        total,
        subtotal,
        shippingCost,
        status,
        customer: rawOrder.customer || rawOrder.cliente || 'Cliente',
        email: rawOrder.email || rawOrder.correo,
        userId: rawOrder.userId,
        items,
        shippingAddress: rawOrder.shippingAddress,
        paymentMethod: rawOrder.paymentMethod,
        transactionId: rawOrder.transactionId || `TXN-${id}`,
        notes: rawOrder.notes || ''
      };

      return normalizedOrder;
    } catch (error) {
      console.error('Error al normalizar pedido:', error);
      return null;
    }
  }

  /**
   * Limpia pedidos duplicados o corruptos
   */
  static cleanupOrders(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const orders = this.getAllOrders();
      const cleanOrders = orders.filter((order, index, self) => 
        // Eliminar duplicados por ID
        index === self.findIndex(o => o.id === order.id) &&
        // Filtrar pedidos válidos
        order.id && 
        order.total >= 0 &&
        order.items.length > 0
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanOrders));
      
      console.log(`🧹 Limpieza completada: ${orders.length} → ${cleanOrders.length} pedidos`);
      return true;
    } catch (error) {
      console.error('Error al limpiar pedidos:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de pedidos
   */
  static getOrderStats() {
    const orders = this.getAllOrders();
    
    return {
      total: orders.length,
      enProceso: orders.filter(o => o.status === 'En proceso').length,
      procesando: orders.filter(o => o.status === 'Procesando').length,
      enviado: orders.filter(o => o.status === 'Enviado').length,
      completado: orders.filter(o => o.status === 'Completado').length,
      cancelado: orders.filter(o => o.status === 'Cancelado').length,
      totalVentas: orders.reduce((sum, order) => sum + order.total, 0),
      promedioVenta: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
    };
  }
}

// Exportar funciones al objeto global para debugging
declare global {
  interface Window {
    OrderManager?: typeof OrderManager;
  }
}

if (typeof window !== 'undefined') {
  window.OrderManager = OrderManager;
}
