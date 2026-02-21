import { create } from 'zustand';
import type { AppState, Order, OrderItem, TableStatus, BranchId, Role, CustomerMenuItem, CartItem, Notification, Payment, PurchaseOrder, ClockRecord, Feedback } from '../types';
import { getInventory, getActiveOrders, getFloorTables, getInitialNotifications, getMockPurchaseOrders, getMockClockRecords } from '../mockData';
import { eventBus } from '../lib/eventBus';
import { logAudit } from '../lib/auditLog';
import * as supabaseWrites from '../lib/supabaseWrites';

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'ADMIN' as Role,
  selectedBranch: 'branch-a' as BranchId,
  inventory: getInventory(),
  activeOrders: getActiveOrders(),
  floorTables: getFloorTables(),
  notifications: getInitialNotifications(),
  cart: [] as CartItem[],
  orderingEnabled: true,

  // New state slices
  payments: [] as Payment[],
  purchaseOrders: getMockPurchaseOrders(),
  clockRecords: getMockClockRecords(),
  feedbackRecords: [] as Feedback[],
  lockedTables: new Set<number>(),

  setRole: (role: Role) => set({ currentRole: role }),

  setBranch: (branch: BranchId) => set({ selectedBranch: branch }),

  addOrder: (order: Order) => {
    const state = get();
    set({ activeOrders: [...state.activeOrders, order] });
    state.deductInventory(order.items);
    state.updateTableStatus(order.tableId, 'occupied', order.id, order.waiter);
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.insertOrder(order);
    }
    eventBus.emit('ORDER_PLACED', {
      orderId: order.id,
      tableId: order.tableId,
      items: order.items.map(i => ({ name: i.name, quantity: i.quantity })),
    });
    logAudit({ flowId: 'pos', action: 'ORDER_PLACED', actor: order.waiter || 'customer', metadata: { orderId: order.id } });
  },

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const state = get();
    const order = state.activeOrders.find(o => o.id === orderId);
    const prevStatus = order?.status;
    set(s => ({
      activeOrders: s.activeOrders.map(o =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.updateOrderStatus(orderId, status, order?.locked);
    }
    if (prevStatus) {
      eventBus.emit('ORDER_STATUS_CHANGED', { orderId, from: prevStatus, to: status });
    }
    if (status === 'SERVED' && order) {
      eventBus.emit('ORDER_SERVED', {
        orderId,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity })),
      });
    }
    logAudit({ flowId: 'kds', action: 'ORDER_STATUS_CHANGED', actor: 'kitchen', prevState: prevStatus, newState: status, metadata: { orderId } });
  },

  removeOrder: (orderId: string) => {
    const order = get().activeOrders.find(o => o.id === orderId);
    set(state => {
      const newTables = order
        ? state.floorTables.map(t => t.id === order.tableId ? { ...t, status: 'vacant' as TableStatus, orderId: undefined, waiter: undefined, occupiedSince: undefined } : t)
        : state.floorTables;
      return {
        activeOrders: state.activeOrders.filter(o => o.id !== orderId),
        floorTables: newTables,
      };
    });
    if (supabaseWrites.isSupabaseEnabled && order) {
      void supabaseWrites.deleteOrder(orderId);
      void supabaseWrites.updateFloorTableStatus(order.tableId, 'vacant');
    }
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
          version: inv.version + 1,
          status: newStock <= 0 ? 'CRITICAL' as const : newStock <= inv.reorderPoint ? 'LOW' as const : 'OK' as const,
        };
      }),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      get().inventory.forEach(inv => void supabaseWrites.upsertInventoryItem(inv));
    }
  },

  updateTableStatus: (tableId: number, status: TableStatus, orderId?: string, waiter?: string) => {
    set(state => ({
      floorTables: state.floorTables.map(t =>
        t.id === tableId
          ? { ...t, status, orderId, waiter: waiter ?? t.waiter, occupiedSince: status === 'occupied' ? new Date() : undefined }
          : t
      ),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      const table = get().floorTables.find(t => t.id === tableId);
      if (table) {
        void supabaseWrites.updateFloorTableStatus(
          tableId,
          table.status,
          table.orderId,
          table.waiter,
          table.occupiedSince
        );
      }
    }
    eventBus.emit('TABLE_STATUS_CHANGED', { tableId, from: '', to: status });
  },

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const n = { ...notification, id: `n-${Date.now()}`, timestamp: new Date(), read: false };
    set(state => ({ notifications: [n, ...state.notifications] }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.insertNotification(n);
    }
  },

  markNotificationRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.updateNotificationRead(id, true);
    }
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
          ? { ...inv, stock: inv.stock + amount, version: inv.version + 1, status: (inv.stock + amount) > inv.reorderPoint ? 'OK' as const : 'LOW' as const }
          : inv
      ),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      const inv = get().inventory.find(i => i.id === itemId);
      if (inv) void supabaseWrites.upsertInventoryItem(inv);
    }
  },

  // === New actions ===

  processPayment: (payment) => {
    const id = `pay-${Date.now()}`;
    const receiptId = `RCP-${Date.now().toString(36).toUpperCase()}`;
    const full: Payment = { ...payment, id, receiptId, timestamp: new Date() };
    set(state => ({ payments: [...state.payments, full] }));

    // Simulate processing delay
    setTimeout(() => {
      set(state => ({
        payments: state.payments.map(p => p.id === id ? { ...p, status: 'COMPLETED' } : p),
      }));
      eventBus.emit('PAYMENT_COMPLETED', {
        orderId: payment.orderId,
        tableId: payment.tableId,
        amount: payment.amount,
        method: payment.method,
      });
      logAudit({ flowId: 'payment', action: 'PAYMENT_COMPLETED', actor: 'system', metadata: { paymentId: id, amount: payment.amount } });
    }, 1500);
  },

  lockTable: (tableId: number) => {
    set(state => {
      const next = new Set(state.lockedTables);
      next.add(tableId);
      return { lockedTables: next };
    });
  },

  unlockTable: (tableId: number) => {
    set(state => {
      const next = new Set(state.lockedTables);
      next.delete(tableId);
      return { lockedTables: next };
    });
  },

  lockOrder: (orderId: string) => {
    set(state => ({
      activeOrders: state.activeOrders.map(o => o.id === orderId ? { ...o, locked: true } : o),
    }));
    logAudit({ flowId: 'billing', action: 'ORDER_LOCKED', actor: 'waiter', metadata: { orderId } });
  },

  createPO: (po) => {
    const id = `po-${Date.now()}`;
    const now = new Date();
    const full = { ...po, id, createdAt: now, updatedAt: now };
    set(state => ({ purchaseOrders: [...state.purchaseOrders, full] }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.insertPurchaseOrder(full);
    }
    logAudit({ flowId: 'procurement', action: 'PO_CREATED', actor: 'system', metadata: { poId: id } });
  },

  approvePO: (poId: string, approver: string) => {
    set(state => ({
      purchaseOrders: state.purchaseOrders.map(po =>
        po.id === poId ? { ...po, status: 'APPROVED', approvedBy: approver, updatedAt: new Date() } : po
      ),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.updatePurchaseOrderStatus(poId, 'APPROVED', { approvedBy: approver });
    }
    logAudit({ flowId: 'procurement', action: 'PO_APPROVED', actor: approver, metadata: { poId } });
  },

  receivePO: (poId: string) => {
    const state = get();
    const po = state.purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const grnNumber = `GRN-${Date.now().toString(36).toUpperCase()}`;
    set(s => ({
      purchaseOrders: s.purchaseOrders.map(p =>
        p.id === poId ? { ...p, status: 'RECEIVED', grnNumber, updatedAt: new Date() } : p
      ),
    }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.updatePurchaseOrderStatus(poId, 'RECEIVED', { grnNumber });
    }

    po.items.forEach(item => {
      state.restockItem(item.inventoryId, item.quantity);
    });

    logAudit({ flowId: 'procurement', action: 'GOODS_RECEIVED', actor: 'warehouse', metadata: { poId, grnNumber } });
  },

  clockIn: (record) => {
    const id = `clk-${Date.now()}`;
    const full = { ...record, id };
    set(state => ({ clockRecords: [...state.clockRecords, full] }));
    if (supabaseWrites.isSupabaseEnabled) {
      void supabaseWrites.insertClockRecord(full);
    }
    if (record.isLate) {
      get().addNotification({
        type: 'warning',
        title: '⏰ Late Clock-In',
        message: `${record.staffName} clocked in late`,
      });
    }
    eventBus.emit('SHIFT_CLOCKED_IN', { staffId: record.staffId, isLate: record.isLate });
    logAudit({ flowId: 'hr', action: 'CLOCK_IN', actor: record.staffName, metadata: { isLate: record.isLate, geoVerified: record.geoVerified } });
  },

  clockOut: (recordId: string) => {
    set(state => {
      const r = state.clockRecords.find(rec => rec.id === recordId);
      if (!r) return state;
      const clockOut = new Date();
      const hoursWorked = Math.round((clockOut.getTime() - r.clockIn.getTime()) / 3600000 * 100) / 100;
      if (supabaseWrites.isSupabaseEnabled) {
        void supabaseWrites.updateClockRecordOut(recordId, clockOut, hoursWorked);
      }
      return {
        clockRecords: state.clockRecords.map(rec =>
          rec.id !== recordId ? rec : { ...rec, clockOut, hoursWorked }
        ),
      };
    });
    logAudit({ flowId: 'hr', action: 'CLOCK_OUT', actor: 'system', metadata: { recordId } });
  },

  submitFeedback: (feedback) => {
    const id = `fb-${Date.now()}`;
    set(state => ({
      feedbackRecords: [...state.feedbackRecords, { ...feedback, id, timestamp: new Date() }],
    }));
    eventBus.emit('FEEDBACK_SUBMITTED', { orderId: feedback.orderId, rating: feedback.rating, comment: feedback.comment });

    if (feedback.rating < 3) {
      get().addNotification({
        type: 'alert',
        title: '⚠️ Low Customer Rating',
        message: `Customer rated ${feedback.rating}/5 stars. Manager attention needed.`,
      });
    }

    logAudit({ flowId: 'feedback', action: 'FEEDBACK_SUBMITTED', actor: 'customer', metadata: { rating: feedback.rating } });
  },

  hydrateInventory: (items) => set({ inventory: items }),
  hydrateActiveOrders: (orders) => set({ activeOrders: orders }),
  hydrateFloorTables: (tables) => set({ floorTables: tables }),
  hydrateNotifications: (notifications) => set({ notifications }),
  hydratePurchaseOrders: (list) => set({ purchaseOrders: list }),
  hydrateClockRecords: (list) => set({ clockRecords: list }),
}));
