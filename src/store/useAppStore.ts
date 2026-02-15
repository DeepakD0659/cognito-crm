import { create } from 'zustand';
import type { AppState, Order, OrderItem, TableStatus, BranchId, Role, CustomerMenuItem, CartItem, Notification } from '../types';
import { getInventory, getActiveOrders, getFloorTables, getInitialNotifications } from '../mockData';

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'ADMIN' as Role,
  selectedBranch: 'branch-a' as BranchId,
  inventory: getInventory(),
  activeOrders: getActiveOrders(),
  floorTables: getFloorTables(),
  notifications: getInitialNotifications(),
  cart: [] as CartItem[],
  orderingEnabled: true,

  setRole: (role: Role) => set({ currentRole: role }),

  setBranch: (branch: BranchId) => set({ selectedBranch: branch }),

  addOrder: (order: Order) => {
    const state = get();
    set({ activeOrders: [...state.activeOrders, order] });
    // Auto-deduct inventory
    state.deductInventory(order.items);
    // Update table status
    state.updateTableStatus(order.tableId, 'occupied', order.id);
  },

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    set(state => ({
      activeOrders: state.activeOrders.map(o =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));
  },

  removeOrder: (orderId: string) => {
    set(state => {
      const order = state.activeOrders.find(o => o.id === orderId);
      const newTables = order
        ? state.floorTables.map(t => t.id === order.tableId ? { ...t, status: 'vacant' as TableStatus, orderId: undefined, waiter: undefined, occupiedSince: undefined } : t)
        : state.floorTables;
      return {
        activeOrders: state.activeOrders.filter(o => o.id !== orderId),
        floorTables: newTables,
      };
    });
  },

  deductInventory: (items: OrderItem[]) => {
    set(state => ({
      inventory: state.inventory.map(inv => {
        const matchingItems = items.filter(i => inv.name.toLowerCase().includes(i.name.toLowerCase().split(' ')[0]));
        if (matchingItems.length === 0) return inv;
        const totalDeduct = matchingItems.reduce((sum, i) => sum + i.quantity, 0);
        const newStock = Math.max(0, inv.stock - totalDeduct);
        return {
          ...inv,
          stock: newStock,
          status: newStock <= 0 ? 'CRITICAL' as const : newStock <= inv.reorderPoint ? 'LOW' as const : 'OK' as const,
        };
      }),
    }));
  },

  updateTableStatus: (tableId: number, status: TableStatus, orderId?: string) => {
    set(state => ({
      floorTables: state.floorTables.map(t =>
        t.id === tableId ? { ...t, status, orderId, occupiedSince: status === 'occupied' ? new Date() : undefined } : t
      ),
    }));
  },

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    set(state => ({
      notifications: [
        { ...notification, id: `n-${Date.now()}`, timestamp: new Date(), read: false },
        ...state.notifications,
      ],
    }));
  },

  markNotificationRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  },

  addToCart: (item: CustomerMenuItem) => {
    set(state => {
      const existing = state.cart.find(c => c.id === item.id);
      if (existing) {
        return { cart: state.cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    });
  },

  removeFromCart: (itemId: string) => {
    set(state => {
      const existing = state.cart.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return { cart: state.cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c) };
      }
      return { cart: state.cart.filter(c => c.id !== itemId) };
    });
  },

  clearCart: () => set({ cart: [] }),

  toggleOrdering: () => set(state => ({ orderingEnabled: !state.orderingEnabled })),

  restockItem: (itemId: string, amount: number) => {
    set(state => ({
      inventory: state.inventory.map(inv =>
        inv.id === itemId
          ? { ...inv, stock: inv.stock + amount, status: (inv.stock + amount) > inv.reorderPoint ? 'OK' as const : 'LOW' as const }
          : inv
      ),
    }));
  },
}));
