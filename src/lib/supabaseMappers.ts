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

// --- CRM: map from DB (snake_case -> camelCase) ---
export function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    company: (row.company as string) ?? undefined,
    source: (row.source as string) ?? 'sales',
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: (row.id as string) ?? '',
    contactId: (row.contact_id as string) ?? '',
    score: Number(row.score) ?? 0,
    status: ((row.status as string) ?? 'new') as Lead['status'],
    assignedTo: (row.assigned_to as string) ?? undefined,
    stage: (row.stage as string) as Lead['stage'] | undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: (row.id as string) ?? '',
    leadId: (row.lead_id as string) ?? '',
    stage: ((row.stage as string) ?? 'pipeline') as Opportunity['stage'],
    value: Number(row.value) ?? 0,
    closedAt: row.closed_at ? parseDate(row.closed_at as string) : undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: (row.id as string) ?? '',
    contactId: (row.contact_id as string) ?? undefined,
    details: (row.details as string) ?? '',
    hotLead: Boolean(row.hot_lead),
    assignedTo: (row.assigned_to as string) ?? undefined,
    status: ((row.status as string) ?? 'new') as Inquiry['status'],
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapKbArticle(row: Record<string, unknown>): KbArticle {
  return {
    id: (row.id as string) ?? '',
    title: (row.title as string) ?? '',
    content: (row.content as string) ?? '',
    keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapSupportTicket(row: Record<string, unknown>): SupportTicket {
  return {
    id: (row.id as string) ?? '',
    contactId: (row.contact_id as string) ?? undefined,
    userId: (row.user_id as string) ?? undefined,
    subject: (row.subject as string) ?? '',
    description: (row.description as string) ?? '',
    assignedTo: (row.assigned_to as string) ?? undefined,
    status: ((row.status as string) ?? 'open') as SupportTicket['status'],
    knownIssue: Boolean(row.known_issue),
    kbArticleId: (row.kb_article_id as string) ?? undefined,
    resolvedAt: row.resolved_at ? parseDate(row.resolved_at as string) : undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    launchedAt: row.launched_at ? parseDate(row.launched_at as string) : undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapCampaignLead(row: Record<string, unknown>): CampaignLead {
  return {
    id: (row.id as string) ?? '',
    campaignId: (row.campaign_id as string) ?? '',
    leadId: (row.lead_id as string) ?? '',
    criteriaMet: Boolean(row.criteria_met),
    createdAt: parseDate(row.created_at as string),
  };
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    scope: (row.scope as string) ?? undefined,
    status: ((row.status as string) ?? 'planning') as Project['status'],
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapProjectMilestone(row: Record<string, unknown>): ProjectMilestone {
  return {
    id: (row.id as string) ?? '',
    projectId: (row.project_id as string) ?? '',
    name: (row.name as string) ?? '',
    reachedAt: row.reached_at ? parseDate(row.reached_at as string) : undefined,
    approved: Boolean(row.approved),
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapFeatureRequest(row: Record<string, unknown>): FeatureRequest {
  return {
    id: (row.id as string) ?? '',
    title: (row.title as string) ?? '',
    requirements: (row.requirements as string) ?? undefined,
    priority: Number(row.priority) ?? 0,
    approvedForDev: Boolean(row.approved_for_dev),
    status: ((row.status as string) ?? 'backlog') as FeatureRequest['status'],
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapMarketingAsset(row: Record<string, unknown>): MarketingAsset {
  return {
    id: (row.id as string) ?? '',
    title: (row.title as string) ?? '',
    content: (row.content as string) ?? undefined,
    status: ((row.status as string) ?? 'draft') as MarketingAsset['status'],
    legalApproved: Boolean(row.legal_approved),
    publishedAt: row.published_at ? parseDate(row.published_at as string) : undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export function mapUserProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: (row.id as string) ?? '',
    role: (row.role as string) ?? 'CUSTOMER',
    permissions: (row.permissions as Record<string, unknown>) ?? {},
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

// --- CRM: to DB (camelCase -> snake_case) ---
export function contactToRow(c: Contact): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    source: c.source,
    updated_at: c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function leadToRow(l: Lead): Record<string, unknown> {
  return {
    id: l.id,
    contact_id: l.contactId,
    score: l.score,
    status: l.status,
    assigned_to: l.assignedTo ?? null,
    stage: l.stage ?? null,
    updated_at: l.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function opportunityToRow(o: Opportunity): Record<string, unknown> {
  return {
    id: o.id,
    lead_id: o.leadId,
    stage: o.stage,
    value: o.value,
    closed_at: o.closedAt?.toISOString?.() ?? null,
    updated_at: o.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function inquiryToRow(i: Inquiry): Record<string, unknown> {
  return {
    id: i.id,
    contact_id: i.contactId ?? null,
    details: i.details,
    hot_lead: i.hotLead,
    assigned_to: i.assignedTo ?? null,
    status: i.status,
    updated_at: i.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function kbArticleToRow(k: KbArticle): Record<string, unknown> {
  return {
    id: k.id,
    title: k.title,
    content: k.content,
    keywords: k.keywords ?? [],
    updated_at: k.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function supportTicketToRow(t: SupportTicket): Record<string, unknown> {
  return {
    id: t.id,
    contact_id: t.contactId ?? null,
    user_id: t.userId ?? null,
    subject: t.subject,
    description: t.description,
    assigned_to: t.assignedTo ?? null,
    status: t.status,
    known_issue: t.knownIssue,
    kb_article_id: t.kbArticleId ?? null,
    resolved_at: t.resolvedAt?.toISOString?.() ?? null,
    updated_at: t.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function campaignToRow(c: Campaign): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    launched_at: c.launchedAt?.toISOString?.() ?? null,
    updated_at: c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function campaignLeadToRow(cl: CampaignLead): Record<string, unknown> {
  return {
    id: cl.id,
    campaign_id: cl.campaignId,
    lead_id: cl.leadId,
    criteria_met: cl.criteriaMet,
  };
}

export function projectToRow(p: Project): Record<string, unknown> {
  return {
    id: p.id,
    name: p.name,
    scope: p.scope ?? null,
    status: p.status,
    updated_at: p.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function projectMilestoneToRow(pm: ProjectMilestone): Record<string, unknown> {
  return {
    id: pm.id,
    project_id: pm.projectId,
    name: pm.name,
    reached_at: pm.reachedAt?.toISOString?.() ?? null,
    approved: pm.approved,
    updated_at: pm.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function featureRequestToRow(f: FeatureRequest): Record<string, unknown> {
  return {
    id: f.id,
    title: f.title,
    requirements: f.requirements ?? null,
    priority: f.priority,
    approved_for_dev: f.approvedForDev,
    status: f.status,
    updated_at: f.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function marketingAssetToRow(m: MarketingAsset): Record<string, unknown> {
  return {
    id: m.id,
    title: m.title,
    content: m.content ?? null,
    status: m.status,
    legal_approved: m.legalApproved,
    published_at: m.publishedAt?.toISOString?.() ?? null,
    updated_at: m.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function userProfileToRow(u: UserProfile): Record<string, unknown> {
  return {
    id: u.id,
    role: u.role,
    permissions: u.permissions ?? {},
    updated_at: u.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
