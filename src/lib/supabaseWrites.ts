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
  contactToRow,
  leadToRow,
  opportunityToRow,
  inquiryToRow,
  kbArticleToRow,
  supportTicketToRow,
  campaignToRow,
  campaignLeadToRow,
  projectToRow,
  projectMilestoneToRow,
  featureRequestToRow,
  marketingAssetToRow,
  userProfileToRow,
} from '@/lib/supabaseMappers';
import type {
  Order,
  FloorTable,
  Notification,
  InventoryItem,
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

// --- CRM writes ---
export async function insertContact(contact: Omit<Contact, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const id = contact.id ?? crypto.randomUUID();
  const row = contactToRow({ ...contact, id, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('contacts').insert(row);
  return !error;
}

export async function updateContact(id: string, updates: Partial<Pick<Contact, 'name' | 'email' | 'phone' | 'company' | 'source'>>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name != null) payload.name = updates.name;
  if (updates.email != null) payload.email = updates.email;
  if (updates.phone != null) payload.phone = updates.phone;
  if (updates.company != null) payload.company = updates.company;
  if (updates.source != null) payload.source = updates.source;
  const { error } = await supabase.from('contacts').update(payload).eq('id', id);
  return !error;
}

export async function insertLead(lead: Omit<Lead, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = leadToRow({ ...lead, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('leads').insert(row);
  return !error;
}

export async function updateLeadStatus(leadId: string, status: Lead['status']): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', leadId);
  return !error;
}

export async function updateLeadStage(leadId: string, stage: Lead['stage']): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', leadId);
  return !error;
}

export async function updateLeadAssignedTo(leadId: string, assignedTo: string | null): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('leads').update({ assigned_to: assignedTo, updated_at: new Date().toISOString() }).eq('id', leadId);
  return !error;
}

export async function insertOpportunity(opportunity: Omit<Opportunity, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = opportunityToRow({ ...opportunity, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('opportunities').insert(row);
  return !error;
}

export async function updateOpportunityStage(opportunityId: string, stage: Opportunity['stage'], closedAt?: Date): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { stage, updated_at: new Date().toISOString() };
  if (closedAt) payload.closed_at = closedAt.toISOString();
  const { error } = await supabase.from('opportunities').update(payload).eq('id', opportunityId);
  return !error;
}

export async function insertInquiry(inquiry: Omit<Inquiry, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = inquiryToRow({ ...inquiry, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('inquiries').insert(row);
  return !error;
}

export async function updateInquiryAssignedTo(inquiryId: string, assignedTo: string | null): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('inquiries').update({ assigned_to: assignedTo, status: assignedTo ? 'assigned' : 'new', updated_at: new Date().toISOString() }).eq('id', inquiryId);
  return !error;
}

export async function updateInquiryStatus(inquiryId: string, status: Inquiry['status']): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('inquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', inquiryId);
  return !error;
}

export async function insertKbArticle(article: Omit<KbArticle, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = kbArticleToRow({ ...article, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('kb_articles').insert(row);
  return !error;
}

export async function insertSupportTicket(ticket: Omit<SupportTicket, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = supportTicketToRow({ ...ticket, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('support_tickets').insert(row);
  return !error;
}

export async function updateSupportTicketStatus(ticketId: string, status: SupportTicket['status'], knownIssue?: boolean, kbArticleId?: string): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (knownIssue != null) payload.known_issue = knownIssue;
  if (kbArticleId != null) payload.kb_article_id = kbArticleId;
  const { error } = await supabase.from('support_tickets').update(payload).eq('id', ticketId);
  return !error;
}

export async function updateSupportTicketResolved(ticketId: string): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('support_tickets').update({ status: 'resolved', resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', ticketId);
  return !error;
}

export async function insertCampaign(campaign: Omit<Campaign, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = campaignToRow({ ...campaign, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('campaigns').insert(row);
  return !error;
}

export async function updateCampaignLaunchedAt(campaignId: string, launchedAt: Date): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('campaigns').update({ launched_at: launchedAt.toISOString(), updated_at: new Date().toISOString() }).eq('id', campaignId);
  return !error;
}

export async function insertCampaignLead(campaignLead: Omit<CampaignLead, 'createdAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = campaignLeadToRow({ ...campaignLead, createdAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('campaign_leads').insert(row);
  return !error;
}

export async function insertProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = projectToRow({ ...project, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('projects').insert(row);
  return !error;
}

export async function updateProjectStatus(projectId: string, status: Project['status']): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', projectId);
  return !error;
}

export async function insertProjectMilestone(milestone: Omit<ProjectMilestone, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = projectMilestoneToRow({ ...milestone, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('project_milestones').insert(row);
  return !error;
}

export async function updateProjectMilestoneApproved(milestoneId: string, approved: boolean, reachedAt?: Date): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { approved, updated_at: new Date().toISOString() };
  if (reachedAt) payload.reached_at = reachedAt.toISOString();
  const { error } = await supabase.from('project_milestones').update(payload).eq('id', milestoneId);
  return !error;
}

export async function insertFeatureRequest(fr: Omit<FeatureRequest, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = featureRequestToRow({ ...fr, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('feature_requests').insert(row);
  return !error;
}

export async function updateFeatureRequestApproved(frId: string, approvedForDev: boolean, status?: FeatureRequest['status']): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { approved_for_dev: approvedForDev, updated_at: new Date().toISOString() };
  if (status) payload.status = status;
  const { error } = await supabase.from('feature_requests').update(payload).eq('id', frId);
  return !error;
}

export async function updateFeatureRequestStatus(frId: string, status: FeatureRequest['status']): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('feature_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', frId);
  return !error;
}

export async function insertMarketingAsset(asset: Omit<MarketingAsset, 'createdAt' | 'updatedAt'>): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = marketingAssetToRow({ ...asset, createdAt: new Date(), updatedAt: new Date() }) as Record<string, unknown>;
  const { error } = await supabase.from('marketing_assets').insert(row);
  return !error;
}

export async function updateMarketingAssetLegalApproved(assetId: string, legalApproved: boolean): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase.from('marketing_assets').update({ legal_approved: legalApproved, updated_at: new Date().toISOString() }).eq('id', assetId);
  return !error;
}

export async function updateMarketingAssetStatus(assetId: string, status: MarketingAsset['status'], publishedAt?: Date): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (publishedAt) payload.published_at = publishedAt.toISOString();
  const { error } = await supabase.from('marketing_assets').update(payload).eq('id', assetId);
  return !error;
}

export async function upsertUserProfile(profile: UserProfile): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false;
  const row = userProfileToRow(profile) as Record<string, unknown>;
  const { error } = await supabase.from('user_profiles').upsert(row, { onConflict: 'id' });
  return !error;
}
