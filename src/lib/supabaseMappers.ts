/** Map Supabase snake_case rows to app camelCase types. Parse ISO dates to Date. */

import type {
  Branch,
  InventoryItem,
  Supplier,
  FloorTable,
  Order,
  OrderItem,
  Staff,
  ShiftSlot,
  Notification,
  CustomerMenuItem,
  PurchaseOrder,
  ClockRecord,
  Payment,
  ItemModifier,
} from '@/types';

function parseDate(v: string | null | undefined): Date {
  if (!v) return new Date();
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
}

// --- Branches ---
export function mapBranch(row: Record<string, unknown>): Branch {
  return {
    id: (row.id as string) as Branch['id'],
    name: (row.name as string) ?? '',
    performanceScore: Number(row.performance_score) ?? 0,
  };
}

// --- Inventory ---
export function mapInventoryItem(row: Record<string, unknown>): InventoryItem {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    stock: Number(row.stock) ?? 0,
    unit: (row.unit as string) ?? 'pcs',
    reorderPoint: Number(row.reorder_point) ?? 0,
    expiryDate: (row.expiry_date as string) ?? '',
    status: ((row.status as string) ?? 'OK') as InventoryItem['status'],
    category: (row.category as string) ?? '',
    version: Number(row.version) ?? 1,
  };
}

// --- Suppliers ---
export function mapSupplier(row: Record<string, unknown>): Supplier {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    leadTime: (row.lead_time as string) ?? '',
    rating: Number(row.rating) ?? 0,
  };
}

// --- Floor tables ---
export function mapFloorTable(row: Record<string, unknown>): FloorTable {
  return {
    id: Number(row.id) ?? 0,
    seats: Number(row.seats) ?? 0,
    status: ((row.status as string) ?? 'vacant') as FloorTable['status'],
    orderId: (row.order_id as string) ?? undefined,
    waiter: (row.waiter as string) ?? undefined,
    occupiedSince: row.occupied_since ? parseDate(row.occupied_since as string) : undefined,
  };
}

// --- Order items ---
export function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    price: Number(row.price) ?? 0,
    quantity: Number(row.quantity) ?? 1,
    category: ((row.category as string) ?? 'FOOD') as OrderItem['category'],
    image: (row.image as string) ?? undefined,
    modifiers: Array.isArray(row.modifiers) ? (row.modifiers as ItemModifier[]) : undefined,
  };
}

// --- Orders (with nested order_items from join) ---
export function mapOrder(row: Record<string, unknown> & { order_items?: Record<string, unknown>[] }): Order {
  const items = Array.isArray(row.order_items)
    ? (row.order_items as Record<string, unknown>[]).map(mapOrderItem)
    : [];
  return {
    id: (row.id as string) ?? '',
    tableId: Number(row.table_id) ?? 0,
    items,
    status: ((row.status as string) ?? 'PENDING') as Order['status'],
    timestamp: parseDate((row.created_at as string) ?? row.timestamp as string),
    waiter: (row.waiter as string) ?? undefined,
    route: ((row.route as string) ?? 'BOTH') as Order['route'],
    locked: Boolean(row.locked),
    guestCount: row.guest_count != null ? Number(row.guest_count) : undefined,
  };
}

// --- Staff ---
export function mapStaff(row: Record<string, unknown>): Staff {
  const avail = row.availability;
  const availability = Array.isArray(avail)
    ? (avail as boolean[])
    : [true, true, true, true, true, true, true];
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    role: ((row.role as string) ?? 'Waiter') as Staff['role'],
    hourlyRate: Number(row.hourly_rate) ?? 0,
    availability,
    avatar: (row.avatar as string) ?? undefined,
  };
}

// --- Shift slots ---
export function mapShiftSlot(row: Record<string, unknown>): ShiftSlot {
  return {
    staffId: (row.staff_id as string) ?? '',
    day: Number(row.day) ?? 0,
    shift: ((row.shift as string) ?? 'morning') as ShiftSlot['shift'],
    conflict: (row.conflict as string) ?? undefined,
  };
}

// --- Notifications ---
export function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: (row.id as string) ?? '',
    type: ((row.type as string) ?? 'info') as Notification['type'],
    title: (row.title as string) ?? '',
    message: (row.message as string) ?? '',
    timestamp: parseDate(row.created_at as string),
    read: Boolean(row.read),
  };
}

// --- Menu items (customer-facing) ---
export function mapCustomerMenuItem(row: Record<string, unknown>): CustomerMenuItem {
  const modifiers = row.available_modifiers;
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    description: (row.description as string) ?? '',
    price: Number(row.price) ?? 0,
    image: (row.image as string) ?? '🍽️',
    category: (row.category as string) ?? '',
    popular: Boolean(row.popular),
    upsellItems: Array.isArray(row.upsell_items) ? (row.upsell_items as string[]) : undefined,
    availableModifiers: Array.isArray(modifiers) ? (modifiers as ItemModifier[]) : undefined,
  };
}

// --- Purchase orders ---
export function mapPurchaseOrder(row: Record<string, unknown>): PurchaseOrder {
  const items = (row.items as PurchaseOrder['items']) ?? [];
  return {
    id: (row.id as string) ?? '',
    items,
    supplierId: (row.supplier_id as string) ?? '',
    supplierName: (row.supplier_name as string) ?? '',
    status: ((row.status as string) ?? 'DRAFT') as PurchaseOrder['status'],
    approvedBy: (row.approved_by as string) ?? undefined,
    grnNumber: (row.grn_number as string) ?? undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

// --- Clock records ---
export function mapClockRecord(row: Record<string, unknown>): ClockRecord {
  return {
    id: (row.id as string) ?? '',
    staffId: (row.staff_id as string) ?? '',
    staffName: (row.staff_name as string) ?? '',
    clockIn: parseDate(row.clock_in as string),
    clockOut: row.clock_out ? parseDate(row.clock_out as string) : undefined,
    isLate: Boolean(row.is_late),
    scheduledStart: row.scheduled_start ? parseDate(row.scheduled_start as string) : undefined,
    geoVerified: Boolean(row.geo_verified),
    hoursWorked: row.hours_worked != null ? Number(row.hours_worked) : undefined,
  };
}

// --- Payments ---
export function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: (row.id as string) ?? '',
    orderId: (row.order_id as string) ?? '',
    tableId: Number(row.table_id) ?? 0,
    method: ((row.method as string) ?? 'CARD') as Payment['method'],
    amount: Number(row.amount) ?? 0,
    tip: row.tip != null ? Number(row.tip) : undefined,
    status: ((row.status as string) ?? 'PENDING') as Payment['status'],
    splitDetails: (row.split_details as Payment['splitDetails']) ?? undefined,
    receiptId: (row.receipt_id as string) ?? '',
    timestamp: parseDate(row.created_at as string),
  };
}

// --- To DB (camelCase -> snake_case) for inserts/updates ---
export function inventoryToRow(item: InventoryItem): Record<string, unknown> {
  return {
    id: item.id,
    name: item.name,
    stock: item.stock,
    unit: item.unit,
    reorder_point: item.reorderPoint,
    expiry_date: item.expiryDate || null,
    status: item.status,
    category: item.category,
    version: item.version,
  };
}

export function orderToRow(order: Order): Record<string, unknown> {
  return {
    id: order.id,
    table_id: order.tableId,
    status: order.status,
    route: order.route,
    waiter: order.waiter ?? null,
    guest_count: order.guestCount ?? null,
    locked: order.locked ?? false,
  };
}

export function orderItemToRow(oi: OrderItem, orderId: string): Record<string, unknown> {
  return {
    id: oi.id,
    order_id: orderId,
    name: oi.name,
    price: oi.price,
    quantity: oi.quantity,
    category: oi.category,
    image: oi.image ?? null,
    modifiers: oi.modifiers ?? [],
  };
}

export function floorTableToRow(t: FloorTable): Record<string, unknown> {
  return {
    id: t.id,
    seats: t.seats,
    status: t.status,
    order_id: t.orderId ?? null,
    waiter: t.waiter ?? null,
    occupied_since: t.occupiedSince?.toISOString() ?? null,
  };
}

export function notificationToRow(n: Notification): Record<string, unknown> {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
  };
}
