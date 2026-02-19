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
  updateTableStatus: (tableId: number, status: TableStatus, orderId?: string) => void;
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
}
