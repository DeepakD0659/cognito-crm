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
  mapContact,
  mapLead,
  mapOpportunity,
  mapInquiry,
  mapKbArticle,
  mapSupportTicket,
  mapCampaign,
  mapCampaignLead,
  mapProject,
  mapProjectMilestone,
  mapFeatureRequest,
  mapMarketingAsset,
  mapUserProfile,
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
  Contact,
  Lead,
  Opportunity,
  Inquiry,
  KbArticle,
  SupportTicket,
  Campaign,
  CampaignLead,
  Project,
  ProjectMilestone,
  FeatureRequest,
  MarketingAsset,
  UserProfile,
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

// --- CRM fetches ---
export async function fetchContacts(): Promise<Contact[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapContact);
}

export async function fetchLeads(): Promise<Lead[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapLead);
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapOpportunity);
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapInquiry);
}

export async function fetchKbArticles(): Promise<KbArticle[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('kb_articles').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapKbArticle);
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapSupportTicket);
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapCampaign);
}

export async function fetchCampaignLeads(campaignId?: string): Promise<CampaignLead[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  let q = supabase.from('campaign_leads').select('*').order('created_at', { ascending: false });
  if (campaignId) q = q.eq('campaign_id', campaignId);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []).map(mapCampaignLead);
}

export async function fetchProjects(): Promise<Project[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapProject);
}

export async function fetchProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('project_milestones').select('*').eq('project_id', projectId).order('created_at');
  if (error) return [];
  return (data ?? []).map(mapProjectMilestone);
}

export async function fetchFeatureRequests(): Promise<FeatureRequest[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('feature_requests').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapFeatureRequest);
}

export async function fetchMarketingAssets(): Promise<MarketingAsset[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase.from('marketing_assets').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapMarketingAsset);
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return mapUserProfile(data);
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

export function subscribeLeads(onPayload: (list: Lead[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};
  const refetch = async () => { onPayload(await fetchLeads()); };
  refetch();
  const channel = supabase.channel('leads-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, refetch).subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeOpportunities(onPayload: (list: Opportunity[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};
  const refetch = async () => { onPayload(await fetchOpportunities()); };
  refetch();
  const channel = supabase.channel('opportunities-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, refetch).subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeSupportTickets(onPayload: (list: SupportTicket[]) => void): Unsubscribe {
  if (!isSupabaseEnabled || !supabase) return () => {};
  const refetch = async () => { onPayload(await fetchSupportTickets()); };
  refetch();
  const channel = supabase.channel('support_tickets-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, refetch).subscribe();
  return () => { supabase.removeChannel(channel); };
}
