/** Core types for MH Cognition ERP */

export type Role = 'ADMIN' | 'MANAGER' | 'KITCHEN' | 'CUSTOMER';

export type BranchId = 'branch-a' | 'branch-b';

export interface Branch {
  id: BranchId;
  name: string;
  performanceScore: number;
}

export interface KPIData {
  totalSales: number;
  laborCostPct: number;
  foodCostPct: number;
  netProfit: number;
  salesTrend: number;
}

export interface SalesDataPoint {
  time: string;
  actual: number;
  forecast: number;
}

export interface MenuItemSales {
  name: string;
  revenue: number;
  orders: number;
  category: 'Cash Cow' | 'Star' | 'Puzzle' | 'Dog';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  reorderPoint: number;
  expiryDate: string;
  status: 'OK' | 'LOW' | 'CRITICAL';
  category: string;
  version: number; // optimistic locking
}

export interface Supplier {
  id: string;
  name: string;
  leadTime: string;
  rating: number;
}

export interface ItemModifier {
  id: string;
  label: string;
  price: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'FOOD' | 'DRINK';
  image?: string;
  modifiers?: ItemModifier[];
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  timestamp: Date;
  waiter?: string;
  route: 'KITCHEN' | 'BAR' | 'BOTH';
  locked?: boolean; // prevents modifications after bill request
  guestCount?: number;
}

export type TableStatus = 'vacant' | 'occupied' | 'reserved' | 'alert';

export interface FloorTable {
  id: number;
  seats: number;
  status: TableStatus;
  orderId?: string;
  waiter?: string;
  occupiedSince?: Date;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Manager' | 'Kitchen' | 'Waiter' | 'Bartender';
  hourlyRate: number;
  availability: boolean[];
  avatar?: string;
}

export interface ShiftSlot {
  staffId: string;
  day: number;
  shift: 'morning' | 'afternoon' | 'evening';
  conflict?: string;
}

export interface PayrollSummary {
  staffId: string;
  name: string;
  role: string;
  hoursWorked: number;
  overtime: number;
  basePay: number;
  otPay: number;
  epf: number;
  socso: number;
  netPay: number;
}

export interface Notification {
  id: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface CustomerMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  upsellItems?: string[];
  availableModifiers?: ItemModifier[];
}

export interface LoyaltyInfo {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  nextTierPoints: number;
  totalSpent: number;
}

export interface CartItem extends CustomerMenuItem {
  quantity: number;
  selectedModifiers?: ItemModifier[];
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  type: 'revenue' | 'staffing' | 'menu';
  applied: boolean;
}

// === New types for 8-flow workflow engine ===

export type PaymentMethod = 'CASH' | 'CARD' | 'E_WALLET';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  orderId: string;
  tableId: number;
  method: PaymentMethod;
  amount: number;
  tip?: number;
  status: PaymentStatus;
  splitDetails?: { guestIndex: number; amount: number }[];
  receiptId: string;
  timestamp: Date;
}

export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SHIPPED' | 'RECEIVED';

export interface PurchaseOrder {
  id: string;
  items: { inventoryId: string; name: string; quantity: number; unit: string }[];
  supplierId: string;
  supplierName: string;
  status: POStatus;
  approvedBy?: string;
  grnNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClockRecord {
  id: string;
  staffId: string;
  staffName: string;
  clockIn: Date;
  clockOut?: Date;
  isLate: boolean;
  scheduledStart?: Date;
  geoVerified: boolean;
  hoursWorked?: number;
}

export interface Feedback {
  id: string;
  orderId: string;
  rating: number;
  comment?: string;
  loyaltyPointsAwarded: number;
  timestamp: Date;
}

// === CRM types (11-flow implementation) ===

export type LeadStatus = 'new' | 'nurture' | 'qualified' | 'closed_won' | 'closed_lost';
export type LeadStage = 'discovery' | 'proposal' | 'negotiation';
export type OpportunityStage = 'pipeline' | 'negotiation' | 'closed_won' | 'closed_lost';
export type InquiryStatus = 'new' | 'assigned' | 'qualified' | 'closed';
export type SupportTicketStatus = 'open' | 'diagnosing' | 'resolved';
export type ProjectStatus = 'planning' | 'executing' | 'completed';
export type FeatureRequestStatus = 'backlog' | 'approved' | 'in_progress' | 'deployed' | 'archived';
export type MarketingAssetStatus = 'draft' | 'review' | 'published';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  contactId: string;
  score: number;
  status: LeadStatus;
  assignedTo?: string;
  stage?: LeadStage;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  leadId: string;
  stage: OpportunityStage;
  value: number;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquiry {
  id: string;
  contactId?: string;
  details: string;
  hotLead: boolean;
  assignedTo?: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface KbArticle {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  contactId?: string;
  userId?: string;
  subject: string;
  description: string;
  assignedTo?: string;
  status: SupportTicketStatus;
  knownIssue: boolean;
  kbArticleId?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  launchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignLead {
  id: string;
  campaignId: string;
  leadId: string;
  criteriaMet: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  scope?: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  reachedAt?: Date;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureRequest {
  id: string;
  title: string;
  requirements?: string;
  priority: number;
  approvedForDev: boolean;
  status: FeatureRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingAsset {
  id: string;
  title: string;
  content?: string;
  status: MarketingAssetStatus;
  legalApproved: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  role: string;
  permissions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  currentRole: Role;
  selectedBranch: BranchId;
  inventory: InventoryItem[];
  activeOrders: Order[];
  floorTables: FloorTable[];
  notifications: Notification[];
  cart: CartItem[];
  orderingEnabled: boolean;

  // New state slices
  payments: Payment[];
  purchaseOrders: PurchaseOrder[];
  clockRecords: ClockRecord[];
  feedbackRecords: Feedback[];
  lockedTables: Set<number>;

  // Existing actions
  setRole: (role: Role) => void;
  setBranch: (branch: BranchId) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  removeOrder: (orderId: string) => void;
  deductInventory: (items: OrderItem[]) => void;
  updateTableStatus: (tableId: number, status: TableStatus, orderId?: string, waiter?: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  addToCart: (item: CustomerMenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleOrdering: () => void;
  restockItem: (itemId: string, amount: number) => void;

  // New actions
  processPayment: (payment: Omit<Payment, 'id' | 'timestamp' | 'receiptId'>) => void;
  lockTable: (tableId: number) => void;
  unlockTable: (tableId: number) => void;
  lockOrder: (orderId: string) => void;
  createPO: (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  approvePO: (poId: string, approver: string) => void;
  receivePO: (poId: string) => void;
  clockIn: (record: Omit<ClockRecord, 'id'>) => void;
  clockOut: (recordId: string) => void;
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp'>) => void;

  // Supabase sync: replace slices from real-time (no extra reads)
  hydrateInventory: (items: InventoryItem[]) => void;
  hydrateActiveOrders: (orders: Order[]) => void;
  hydrateFloorTables: (tables: FloorTable[]) => void;
  hydrateNotifications: (notifications: Notification[]) => void;
  hydratePurchaseOrders: (list: PurchaseOrder[]) => void;
  hydrateClockRecords: (list: ClockRecord[]) => void;
}
