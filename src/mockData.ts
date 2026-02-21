import type { Branch, InventoryItem, Order, FloorTable, Staff, Supplier, SalesDataPoint, MenuItemSales, KPIData, CustomerMenuItem, PayrollSummary, ShiftSlot, LoyaltyInfo, AIRecommendation, Notification, BranchId, PurchaseOrder, ClockRecord, Payment, Contact, Lead, Opportunity, Inquiry, KbArticle, SupportTicket, Campaign, Project, FeatureRequest, MarketingAsset } from './types';

export const branches: Branch[] = [
  { id: 'branch-a', name: 'Downtown Flagship', performanceScore: 92 },
  { id: 'branch-b', name: 'Mall Outlet', performanceScore: 64 },
];

export const getKPIData = (branchId: BranchId): KPIData => {
  if (branchId === 'branch-a') {
    return { totalSales: 128450, laborCostPct: 24.5, foodCostPct: 28.2, netProfit: 38120, salesTrend: 15.3 };
  }
  return { totalSales: 72300, laborCostPct: 32.1, foodCostPct: 35.8, netProfit: 12400, salesTrend: -4.2 };
};

export const getSalesData = (branchId: BranchId): SalesDataPoint[] => {
  const base = branchId === 'branch-a' ? 5000 : 2800;
  return ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM'].map((time, i) => {
    const mult = i >= 3 && i <= 5 ? 1.8 : i >= 8 ? 1.6 : 1;
    return {
      time,
      actual: Math.round(base * mult * (0.85 + Math.random() * 0.3)),
      forecast: Math.round(base * mult),
    };
  });
};

export const getMenuItems = (): MenuItemSales[] => [
  { name: 'Truffle Burger', revenue: 18400, orders: 460, category: 'Cash Cow' },
  { name: 'Wagyu Steak', revenue: 22100, orders: 220, category: 'Star' },
  { name: 'Caesar Salad', revenue: 4200, orders: 350, category: 'Dog' },
  { name: 'Lobster Roll', revenue: 15600, orders: 180, category: 'Star' },
  { name: 'Fish & Chips', revenue: 8900, orders: 420, category: 'Cash Cow' },
  { name: 'Mushroom Soup', revenue: 2100, orders: 280, category: 'Dog' },
  { name: 'Fusion Tacos', revenue: 6700, orders: 190, category: 'Puzzle' },
  { name: 'Matcha Latte', revenue: 5400, orders: 540, category: 'Cash Cow' },
];

export const getInventory = (): InventoryItem[] => [
  { id: 'inv-1', name: 'Beef Patty', stock: 45, unit: 'pcs', reorderPoint: 50, expiryDate: '2026-02-20', status: 'LOW', category: 'Protein', version: 1 },
  { id: 'inv-2', name: 'Brioche Bun', stock: 120, unit: 'pcs', reorderPoint: 40, expiryDate: '2026-02-18', status: 'OK', category: 'Bakery', version: 1 },
  { id: 'inv-3', name: 'Truffle Oil', stock: 3, unit: 'bottles', reorderPoint: 5, expiryDate: '2026-06-01', status: 'CRITICAL', category: 'Condiments', version: 1 },
  { id: 'inv-4', name: 'Lettuce', stock: 25, unit: 'heads', reorderPoint: 15, expiryDate: '2026-02-17', status: 'OK', category: 'Produce', version: 1 },
  { id: 'inv-5', name: 'Wagyu Beef', stock: 8, unit: 'kg', reorderPoint: 10, expiryDate: '2026-02-19', status: 'LOW', category: 'Protein', version: 1 },
  { id: 'inv-6', name: 'French Fries', stock: 200, unit: 'portions', reorderPoint: 50, expiryDate: '2026-04-15', status: 'OK', category: 'Sides', version: 1 },
  { id: 'inv-7', name: 'Lobster Tail', stock: 4, unit: 'pcs', reorderPoint: 8, expiryDate: '2026-02-16', status: 'CRITICAL', category: 'Seafood', version: 1 },
  { id: 'inv-8', name: 'Craft Beer', stock: 72, unit: 'bottles', reorderPoint: 24, expiryDate: '2026-08-01', status: 'OK', category: 'Beverages', version: 1 },
  { id: 'inv-9', name: 'Matcha Powder', stock: 12, unit: 'bags', reorderPoint: 5, expiryDate: '2026-09-01', status: 'OK', category: 'Beverages', version: 1 },
  { id: 'inv-10', name: 'Cheddar Cheese', stock: 6, unit: 'kg', reorderPoint: 8, expiryDate: '2026-02-22', status: 'LOW', category: 'Dairy', version: 1 },
];

export const getSuppliers = (): Supplier[] => [
  { id: 'sup-1', name: 'FreshFarm Co.', leadTime: '1-2 days', rating: 4.8 },
  { id: 'sup-2', name: 'Ocean Harvest', leadTime: '2-3 days', rating: 4.5 },
  { id: 'sup-3', name: 'Metro Wholesale', leadTime: 'Same day', rating: 4.2 },
  { id: 'sup-4', name: 'Premium Meats Ltd.', leadTime: '1 day', rating: 4.9 },
];

export const getFloorTables = (): FloorTable[] => [
  { id: 1, seats: 2, status: 'vacant' },
  { id: 2, seats: 4, status: 'occupied', orderId: 'ord-1', waiter: 'Sarah', occupiedSince: new Date(Date.now() - 25 * 60000) },
  { id: 3, seats: 2, status: 'reserved' },
  { id: 4, seats: 6, status: 'occupied', orderId: 'ord-2', waiter: 'James', occupiedSince: new Date(Date.now() - 10 * 60000) },
  { id: 5, seats: 4, status: 'vacant' },
  { id: 6, seats: 8, status: 'occupied', orderId: 'ord-3', waiter: 'Sarah', occupiedSince: new Date(Date.now() - 45 * 60000) },
  { id: 7, seats: 2, status: 'vacant' },
  { id: 8, seats: 4, status: 'reserved' },
  { id: 9, seats: 4, status: 'occupied', orderId: 'ord-4', waiter: 'Mike', occupiedSince: new Date(Date.now() - 5 * 60000) },
  { id: 10, seats: 2, status: 'vacant' },
  { id: 11, seats: 6, status: 'vacant' },
  { id: 12, seats: 4, status: 'occupied', orderId: 'ord-5', waiter: 'James', occupiedSince: new Date(Date.now() - 35 * 60000) },
];

export const getActiveOrders = (): Order[] => [
  {
    id: 'ord-1', tableId: 2, status: 'PREPARING', timestamp: new Date(Date.now() - 25 * 60000), waiter: 'Sarah', route: 'BOTH',
    items: [
      { id: 'oi-1', name: 'Truffle Burger', price: 24.90, quantity: 2, category: 'FOOD' },
      { id: 'oi-2', name: 'Craft Beer', price: 12.00, quantity: 2, category: 'DRINK' },
    ],
  },
  {
    id: 'ord-2', tableId: 4, status: 'PENDING', timestamp: new Date(Date.now() - 10 * 60000), waiter: 'James', route: 'KITCHEN',
    items: [
      { id: 'oi-3', name: 'Wagyu Steak', price: 58.00, quantity: 1, category: 'FOOD' },
      { id: 'oi-4', name: 'Caesar Salad', price: 14.00, quantity: 2, category: 'FOOD' },
    ],
  },
  {
    id: 'ord-3', tableId: 6, status: 'READY', timestamp: new Date(Date.now() - 45 * 60000), waiter: 'Sarah', route: 'BOTH',
    items: [
      { id: 'oi-5', name: 'Lobster Roll', price: 32.00, quantity: 3, category: 'FOOD' },
      { id: 'oi-6', name: 'Matcha Latte', price: 8.50, quantity: 3, category: 'DRINK' },
    ],
  },
  {
    id: 'ord-4', tableId: 9, status: 'PENDING', timestamp: new Date(Date.now() - 5 * 60000), waiter: 'Mike', route: 'KITCHEN',
    items: [
      { id: 'oi-7', name: 'Fish & Chips', price: 18.00, quantity: 2, category: 'FOOD' },
    ],
  },
  {
    id: 'ord-5', tableId: 12, status: 'PREPARING', timestamp: new Date(Date.now() - 35 * 60000), waiter: 'James', route: 'BOTH',
    items: [
      { id: 'oi-8', name: 'Fusion Tacos', price: 16.00, quantity: 2, category: 'FOOD' },
      { id: 'oi-9', name: 'Craft Beer', price: 12.00, quantity: 1, category: 'DRINK' },
    ],
  },
];

export const getStaff = (): Staff[] => [
  { id: 'staff-1', name: 'Sarah Chen', role: 'Waiter', hourlyRate: 15, availability: [true, true, false, true, true, true, false] },
  { id: 'staff-2', name: 'James Wilson', role: 'Waiter', hourlyRate: 15, availability: [true, true, true, true, false, true, true] },
  { id: 'staff-3', name: 'Mike Rodriguez', role: 'Waiter', hourlyRate: 15, availability: [false, true, true, true, true, false, true] },
  { id: 'staff-4', name: 'Deepak Sharma', role: 'Kitchen', hourlyRate: 18, availability: [true, true, true, true, true, true, false] },
  { id: 'staff-5', name: 'Aisha Patel', role: 'Kitchen', hourlyRate: 18, availability: [true, false, true, true, true, true, true] },
  { id: 'staff-6', name: 'Tom Baker', role: 'Bartender', hourlyRate: 16, availability: [false, true, true, true, true, true, true] },
  { id: 'staff-7', name: 'Lisa Nguyen', role: 'Manager', hourlyRate: 25, availability: [true, true, true, true, true, false, false] },
];

export const getMockRoster = (): ShiftSlot[] => [
  { staffId: 'staff-1', day: 0, shift: 'morning' },
  { staffId: 'staff-1', day: 1, shift: 'evening' },
  { staffId: 'staff-1', day: 3, shift: 'morning' },
  { staffId: 'staff-2', day: 0, shift: 'evening' },
  { staffId: 'staff-2', day: 1, shift: 'morning' },
  { staffId: 'staff-2', day: 2, shift: 'afternoon' },
  { staffId: 'staff-3', day: 1, shift: 'morning' },
  { staffId: 'staff-3', day: 2, shift: 'evening' },
  { staffId: 'staff-4', day: 0, shift: 'morning' },
  { staffId: 'staff-4', day: 1, shift: 'morning' },
  { staffId: 'staff-4', day: 2, shift: 'morning' },
  { staffId: 'staff-4', day: 3, shift: 'morning' },
  { staffId: 'staff-4', day: 4, shift: 'morning' },
  { staffId: 'staff-5', day: 0, shift: 'evening' },
  { staffId: 'staff-5', day: 2, shift: 'evening' },
  { staffId: 'staff-5', day: 3, shift: 'evening' },
  { staffId: 'staff-6', day: 1, shift: 'evening' },
  { staffId: 'staff-6', day: 2, shift: 'evening' },
  { staffId: 'staff-6', day: 3, shift: 'evening' },
  { staffId: 'staff-6', day: 4, shift: 'evening' },
  { staffId: 'staff-7', day: 0, shift: 'morning' },
  { staffId: 'staff-7', day: 1, shift: 'morning' },
  { staffId: 'staff-7', day: 2, shift: 'morning' },
  { staffId: 'staff-7', day: 3, shift: 'afternoon' },
  { staffId: 'staff-7', day: 4, shift: 'afternoon' },
];

export const getPayrollSummary = (): PayrollSummary[] =>
  getStaff().map(s => {
    const hours = 40 + Math.floor(Math.random() * 10);
    const ot = Math.max(0, hours - 44);
    const base = s.hourlyRate * Math.min(hours, 44);
    const otPay = ot * s.hourlyRate * 1.5;
    const gross = base + otPay;
    return {
      staffId: s.id, name: s.name, role: s.role,
      hoursWorked: hours, overtime: ot,
      basePay: Math.round(base), otPay: Math.round(otPay),
      epf: Math.round(gross * 0.11), socso: Math.round(gross * 0.02),
      netPay: Math.round(gross - gross * 0.13),
    };
  });

export const getCustomerMenu = (): CustomerMenuItem[] => [
  {
    id: 'cm-1', name: 'Truffle Burger', description: 'Premium beef patty with truffle aioli, aged cheddar, and brioche bun', price: 24.90, image: '🍔', category: 'Burgers', popular: true, upsellItems: ['cm-5', 'cm-8'],
    availableModifiers: [
      { id: 'mod-1', label: 'No Onions', price: 0 },
      { id: 'mod-2', label: 'Extra Cheese', price: 2 },
      { id: 'mod-3', label: 'Add Bacon', price: 3 },
    ],
  },
  { id: 'cm-2', name: 'Wagyu Steak', description: 'A5 Wagyu with roasted vegetables and red wine jus', price: 58.00, image: '🥩', category: 'Mains', popular: true },
  { id: 'cm-3', name: 'Lobster Roll', description: 'Fresh lobster in buttered roll with lemon herb mayo', price: 32.00, image: '🦞', category: 'Seafood', popular: true, upsellItems: ['cm-8'] },
  { id: 'cm-4', name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, house-made dressing', price: 14.00, image: '🥗', category: 'Salads' },
  { id: 'cm-5', name: 'Loaded Fries', description: 'Truffle oil, parmesan, herbs', price: 9.50, image: '🍟', category: 'Sides' },
  {
    id: 'cm-6', name: 'Fusion Tacos', description: 'Korean BBQ pulled pork with kimchi slaw', price: 16.00, image: '🌮', category: 'Specials', upsellItems: ['cm-8'],
    availableModifiers: [
      { id: 'mod-4', label: 'Extra Spicy', price: 0 },
      { id: 'mod-5', label: 'Add Avocado', price: 2.50 },
    ],
  },
  { id: 'cm-7', name: 'Fish & Chips', description: 'Beer-battered cod with tartar sauce and mushy peas', price: 18.00, image: '🐟', category: 'Mains' },
  { id: 'cm-8', name: 'Craft Beer', description: 'Local IPA on tap', price: 12.00, image: '🍺', category: 'Drinks' },
  { id: 'cm-9', name: 'Matcha Latte', description: 'Organic ceremonial grade matcha', price: 8.50, image: '🍵', category: 'Drinks', popular: true },
  { id: 'cm-10', name: 'Mushroom Soup', description: 'Wild mushroom velouté with truffle cream', price: 12.00, image: '🍲', category: 'Starters' },
];

export const getLoyaltyInfo = (): LoyaltyInfo => ({
  tier: 'Silver',
  points: 2840,
  nextTierPoints: 5000,
  totalSpent: 1420,
});

export const getAIRecommendations = (): AIRecommendation[] => [
  {
    id: 'ai-1', type: 'revenue',
    title: 'Weekend Revenue Surge',
    description: 'Revenue predicted to rise +15% this weekend based on historical trends and local events.',
    impact: '+$19,268 projected',
    applied: false,
  },
  {
    id: 'ai-2', type: 'staffing',
    title: 'Staffing Shortage Alert',
    description: 'Friday dinner shift understaffed. Recommend scheduling 2 extra waiters.',
    impact: 'Avoid 23min avg wait time',
    applied: false,
  },
  {
    id: 'ai-3', type: 'menu',
    title: 'Menu Price Optimization',
    description: 'Truffle Burger is a Cash Cow with 89% margin. Increase price by $1 without demand impact.',
    impact: '+$460/month profit',
    applied: false,
  },
];

export const getInitialNotifications = (): Notification[] => [
  { id: 'n-1', type: 'warning', title: 'Low Stock Alert', message: 'Truffle Oil is critically low (3 bottles remaining)', timestamp: new Date(Date.now() - 30 * 60000), read: false },
  { id: 'n-2', type: 'alert', title: 'Negative Feedback', message: 'Table 6 rated 2/5 stars. Manager attention needed.', timestamp: new Date(Date.now() - 15 * 60000), read: false },
  { id: 'n-3', type: 'info', title: 'New Reservation', message: 'Party of 8 booked for 7:30 PM tonight', timestamp: new Date(Date.now() - 60 * 60000), read: true },
];

export const getMockPurchaseOrders = (): PurchaseOrder[] => [
  {
    id: 'po-1',
    items: [
      { inventoryId: 'inv-3', name: 'Truffle Oil', quantity: 10, unit: 'bottles' },
      { inventoryId: 'inv-7', name: 'Lobster Tail', quantity: 20, unit: 'pcs' },
    ],
    supplierId: 'sup-2', supplierName: 'Ocean Harvest',
    status: 'APPROVED', approvedBy: 'Lisa Nguyen',
    createdAt: new Date(Date.now() - 2 * 86400000), updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'po-2',
    items: [
      { inventoryId: 'inv-1', name: 'Beef Patty', quantity: 100, unit: 'pcs' },
      { inventoryId: 'inv-5', name: 'Wagyu Beef', quantity: 10, unit: 'kg' },
    ],
    supplierId: 'sup-4', supplierName: 'Premium Meats Ltd.',
    status: 'PENDING_APPROVAL',
    createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 3600000),
  },
];

export const getMockClockRecords = (): ClockRecord[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return [
    {
      id: 'clk-1', staffId: 'staff-1', staffName: 'Sarah Chen',
      clockIn: new Date(today.getTime() + 8 * 3600000),
      clockOut: new Date(today.getTime() + 16 * 3600000),
      isLate: false, scheduledStart: new Date(today.getTime() + 8 * 3600000),
      geoVerified: true, hoursWorked: 8,
    },
    {
      id: 'clk-2', staffId: 'staff-4', staffName: 'Deepak Sharma',
      clockIn: new Date(today.getTime() + 7 * 3600000 + 25 * 60000),
      isLate: true, scheduledStart: new Date(today.getTime() + 7 * 3600000),
      geoVerified: true,
    },
    {
      id: 'clk-3', staffId: 'staff-7', staffName: 'Lisa Nguyen',
      clockIn: new Date(today.getTime() + 9 * 3600000),
      isLate: false, scheduledStart: new Date(today.getTime() + 9 * 3600000),
      geoVerified: true,
    },
  ];
};

// --- CRM mock data (for "Fill with mock" toggle) ---
const now = new Date();
const past = new Date(now.getTime() - 7 * 24 * 3600000);

export const getMockContacts = (): Contact[] => [
  { id: 'mock-c1', name: 'Jane Doe', email: 'jane@acme.com', phone: '+1-555-0101', company: 'Acme Corp', source: 'sales', createdAt: past, updatedAt: now },
  { id: 'mock-c2', name: 'John Smith', email: 'john@startup.io', phone: '+1-555-0102', company: 'Startup IO', source: 'inquiry', createdAt: past, updatedAt: now },
  { id: 'mock-c3', name: 'Alice Lee', email: 'alice@bigco.com', company: 'BigCo', source: 'campaign', createdAt: past, updatedAt: now },
];

export const getMockLeads = (): Lead[] => [
  { id: 'mock-l1', contactId: 'mock-c1', score: 85, status: 'qualified', stage: 'proposal', createdAt: past, updatedAt: now },
  { id: 'mock-l2', contactId: 'mock-c2', score: 45, status: 'nurture', createdAt: past, updatedAt: now },
];

export const getMockOpportunities = (): Opportunity[] => [
  { id: 'mock-o1', leadId: 'mock-l1', stage: 'negotiation', value: 12000, createdAt: past, updatedAt: now },
];

export const getMockInquiries = (): Inquiry[] => [
  { id: 'mock-i1', contactId: 'mock-c1', details: 'Interested in enterprise plan and SLA', hotLead: true, status: 'assigned', createdAt: past, updatedAt: now },
  { id: 'mock-i2', contactId: 'mock-c2', details: 'General pricing question', hotLead: false, status: 'new', createdAt: past, updatedAt: now },
];

export const getMockKbArticles = (): KbArticle[] => [
  { id: 'mock-k1', title: 'Login timeout', content: 'Clear cookies and cache; ensure 2FA is not blocking. Retry after 5 min.', keywords: ['login', 'timeout', '2fa'], createdAt: past, updatedAt: now },
  { id: 'mock-k2', title: 'Export fails', content: 'Check file size limit (max 10k rows). Use date filter and export in chunks.', keywords: ['export', 'limit', 'csv'], createdAt: past, updatedAt: now },
];

export const getMockSupportTickets = (): SupportTicket[] => [
  { id: 'mock-t1', contactId: 'mock-c1', subject: 'Cannot log in', description: 'Session expires after 1 minute', status: 'open', knownIssue: true, kbArticleId: 'mock-k1', createdAt: past, updatedAt: now },
  { id: 'mock-t2', contactId: 'mock-c2', subject: 'Dashboard slow', description: 'Takes 30s to load', status: 'diagnosing', knownIssue: false, createdAt: past, updatedAt: now },
];

export const getMockCampaigns = (): Campaign[] => [
  { id: 'mock-ca1', name: 'Q1 Enterprise Push', launchedAt: past, createdAt: past, updatedAt: now },
  { id: 'mock-ca2', name: 'Webinar Follow-up', createdAt: past, updatedAt: now },
];

export const getMockProjects = (): Project[] => [
  { id: 'mock-p1', name: 'Website Redesign', scope: 'New homepage and checkout', status: 'executing', createdAt: past, updatedAt: now },
  { id: 'mock-p2', name: 'API v2', scope: 'REST + webhooks', status: 'planning', createdAt: past, updatedAt: now },
];

export const getMockFeatureRequests = (): FeatureRequest[] => [
  { id: 'mock-f1', title: 'Dark mode', requirements: 'System theme + manual toggle', priority: 2, approvedForDev: true, status: 'in_progress', createdAt: past, updatedAt: now },
  { id: 'mock-f2', title: 'Bulk export', requirements: 'CSV/Excel for all entities', priority: 1, approvedForDev: false, status: 'backlog', createdAt: past, updatedAt: now },
];

export const getMockMarketingAssets = (): MarketingAsset[] => [
  { id: 'mock-m1', title: 'Blog: Why choose us', content: 'Draft intro and 3 sections...', status: 'review', legalApproved: false, createdAt: past, updatedAt: now },
  { id: 'mock-m2', title: 'Landing page hero', content: 'Headline and CTA copy', status: 'published', legalApproved: true, publishedAt: past, createdAt: past, updatedAt: now },
];
