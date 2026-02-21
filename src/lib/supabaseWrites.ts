/**
 * Supabase write helpers. Call only when isSupabaseEnabled.
 */

import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import {
  orderToRow,
  orderItemToRow,
  floorTableToRow,
  notificationToRow,
  inventoryToRow,
} from '@/lib/supabaseMappers';
import type {
  Order,
  FloorTable,
  Notification,
  InventoryItem,
  PurchaseOrder,
  ClockRecord,
} from '@/types';

export { isSupabaseEnabled };

export async function insertOrder(order: Order): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error: orderError } = await supabase.from('orders').insert(orderToRow(order));
  if (orderError) return false;
  for (const item of order.items) {
    const { error: itemError } = await supabase.from('order_items').insert(orderItemToRow(item, order.id));
    if (itemError) return false;
  }
  return true;
}

export async function updateOrderStatus(orderId: string, status: Order['status'], locked?: boolean): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { status };
  if (locked !== undefined) payload.locked = locked;
  const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
  return !error;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('order_items').delete().eq('order_id', orderId);
  if (error) return false;
  const { error: orderErr } = await supabase.from('orders').delete().eq('id', orderId);
  return !orderErr;
}

export async function upsertFloorTable(table: FloorTable): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('floor_tables').upsert(floorTableToRow(table) as Record<string, unknown>, { onConflict: 'id' });
  return !error;
}

export async function updateFloorTableStatus(
  tableId: number,
  status: FloorTable['status'],
  orderId?: string,
  waiter?: string,
  occupiedSince?: Date
): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = {
    status,
    order_id: orderId ?? null,
    waiter: waiter ?? null,
    occupied_since: occupiedSince?.toISOString() ?? null,
  };
  const { error } = await supabase.from('floor_tables').update(payload).eq('id', tableId);
  return !error;
}

export async function insertNotification(notification: Notification): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = notificationToRow(notification) as Record<string, unknown>;
  const { error } = await supabase.from('notifications').insert(row);
  return !error;
}

export async function updateNotificationRead(id: string, read: boolean): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('notifications').update({ read }).eq('id', id);
  return !error;
}

export async function upsertInventoryItem(item: InventoryItem): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('inventory_items').upsert(inventoryToRow(item) as Record<string, unknown>, { onConflict: 'id' });
  return !error;
}

export async function insertPurchaseOrder(po: PurchaseOrder): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('purchase_orders').insert({
    id: po.id,
    supplier_id: po.supplierId,
    supplier_name: po.supplierName,
    status: po.status,
    approved_by: po.approvedBy ?? null,
    grn_number: po.grnNumber ?? null,
    items: po.items,
  });
  return !error;
}

export async function updatePurchaseOrderStatus(
  poId: string,
  status: PurchaseOrder['status'],
  extra?: { approvedBy?: string; grnNumber?: string }
): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (extra?.approvedBy) payload.approved_by = extra.approvedBy;
  if (extra?.grnNumber) payload.grn_number = extra.grnNumber;
  const { error } = await supabase.from('purchase_orders').update(payload).eq('id', poId);
  return !error;
}

export async function insertClockRecord(record: ClockRecord): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('clock_records').insert({
    id: record.id,
    staff_id: record.staffId,
    staff_name: record.staffName,
    clock_in: record.clockIn.toISOString(),
    clock_out: record.clockOut?.toISOString() ?? null,
    is_late: record.isLate,
    scheduled_start: record.scheduledStart?.toISOString() ?? null,
    geo_verified: record.geoVerified,
    hours_worked: record.hoursWorked ?? null,
  });
  return !error;
}

export async function updateClockRecordOut(recordId: string, clockOut: Date, hoursWorked: number): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase
    .from('clock_records')
    .update({ clock_out: clockOut.toISOString(), hours_worked: hoursWorked })
    .eq('id', recordId);
  return !error;
}
