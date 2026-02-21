/**
 * Supabase data layer: single-read fetches and real-time subscriptions.
 * Use when isSupabaseEnabled; otherwise app uses mock data.
 */

import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import {
  mapBranch,
  mapInventoryItem,
  mapSupplier,
  mapFloorTable,
  mapOrder,
  mapOrderItem,
  mapStaff,
  mapShiftSlot,
  mapNotification,
  mapCustomerMenuItem,
  mapPurchaseOrder,
  mapClockRecord,
} from '@/lib/supabaseMappers';
import type {
  Branch,
  InventoryItem,
  Supplier,
  FloorTable,
  Order,
  Staff,
  ShiftSlot,
  Notification,
  CustomerMenuItem,
  PurchaseOrder,
  ClockRecord,
} from '@/types';

export { isSupabaseEnabled };

// --- Single-read fetches (call once on load; no polling) ---

export async function fetchBranches(): Promise<Branch[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('branches').select('*').order('id');
  if (error) return [];
  return (data ?? []).map(mapBranch);
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('inventory_items').select('*').order('id');
  if (error) return [];
  return (data ?? []).map(mapInventoryItem);
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('suppliers').select('*').order('id');
  if (error) return [];
  return (data ?? []).map(mapSupplier);
}

export async function fetchFloorTables(): Promise<FloorTable[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('floor_tables').select('*').order('id');
  if (error) return [];
  return (data ?? []).map(mapFloorTable);
}

/** Fetches orders with nested order_items in one read. */
export async function fetchOrders(): Promise<Order[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapOrder);
}

export async function fetchStaff(): Promise<Staff[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('staff').select('*').order('id');
  if (error) return [];
  return (data ?? []).map(mapStaff);
}

export async function fetchShiftSlots(): Promise<ShiftSlot[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('shift_slots').select('*').order('day');
  if (error) return [];
  return (data ?? []).map(mapShiftSlot);
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapNotification);
}

export async function fetchMenuItems(): Promise<CustomerMenuItem[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('menu_items').select('*').order('category');
  if (error) return [];
  return (data ?? []).map(mapCustomerMenuItem);
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapPurchaseOrder);
}

export async function fetchClockRecords(): Promise<ClockRecord[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('clock_records')
    .select('*')
    .order('clock_in', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapClockRecord);
}

// --- Real-time subscriptions (one channel per table; reduced read counts) ---

type Unsubscribe = () => void;

export function subscribeOrders(onPayload: (orders: Order[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};

  const refetch = async () => {
    const orders = await fetchOrders();
    onPayload(orders);
  };

  refetch();

  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => { refetch(); }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      () => { refetch(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeFloorTables(onPayload: (tables: FloorTable[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};

  const refetch = async () => {
    const tables = await fetchFloorTables();
    onPayload(tables);
  };

  refetch();

  const channel = supabase
    .channel('floor_tables-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'floor_tables' },
      () => { refetch(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeInventory(onPayload: (items: InventoryItem[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};

  const refetch = async () => {
    const items = await fetchInventory();
    onPayload(items);
  };

  refetch();

  const channel = supabase
    .channel('inventory-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory_items' },
      () => { refetch(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeNotifications(onPayload: (notifications: Notification[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};

  const refetch = async () => {
    const list = await fetchNotifications();
    onPayload(list);
  };

  refetch();

  const channel = supabase
    .channel('notifications-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      () => { refetch(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribePurchaseOrders(onPayload: (list: PurchaseOrder[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};

  const refetch = async () => {
    const list = await fetchPurchaseOrders();
    onPayload(list);
  };

  refetch();

  const channel = supabase
    .channel('purchase_orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'purchase_orders' },
      () => { refetch(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeClockRecords(onPayload: (list: ClockRecord[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};

  const refetch = async () => {
    const list = await fetchClockRecords();
    onPayload(list);
  };

  refetch();

  const channel = supabase
    .channel('clock_records-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'clock_records' },
      () => { refetch(); }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
