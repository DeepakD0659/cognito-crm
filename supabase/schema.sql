-- Complete CRM Database Schema for Supabase
-- Based on TypeScript types in src/types.ts

-- Enable UUID extension for generating IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- INVENTORY MANAGEMENT
-- ============================================

-- Inventory Items Table
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  expiry_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('OK', 'LOW', 'CRITICAL')) DEFAULT 'OK',
  category TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lead_time TEXT NOT NULL,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER MANAGEMENT
-- ============================================

-- Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id INTEGER NOT NULL,
  items JSONB NOT NULL, -- Stores OrderItem array
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED')) DEFAULT 'PENDING',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  waiter TEXT,
  route TEXT CHECK (route IN ('KITCHEN', 'BAR', 'BOTH')),
  locked BOOLEAN DEFAULT FALSE,
  guest_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Floor Tables Table
CREATE TABLE floor_tables (
  id INTEGER PRIMARY KEY,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('vacant', 'occupied', 'reserved', 'alert')) DEFAULT 'vacant',
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  waiter TEXT,
  occupied_since TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item Modifiers Table
CREATE TABLE item_modifiers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Menu Items Table
CREATE TABLE customer_menu_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  upsell_items TEXT[], -- Array of menu item IDs
  available_modifiers TEXT[], -- Array of modifier IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENT MANAGEMENT
-- ============================================

-- Payments Table
CREATE TABLE payments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  table_id INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('CASH', 'CARD', 'E_WALLET')),
  amount DECIMAL(10,2) NOT NULL,
  tip DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
  split_details JSONB, -- Array of {guestIndex, amount} objects
  receipt_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROCUREMENT
-- ============================================

-- Purchase Orders Table
CREATE TABLE purchase_orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  items JSONB NOT NULL, -- Array of {inventoryId, name, quantity, unit} objects
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  supplier_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SHIPPED', 'RECEIVED')) DEFAULT 'DRAFT',
  approved_by TEXT,
  grn_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STAFF MANAGEMENT
-- ============================================

-- Staff Table
CREATE TABLE staff (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Manager', 'Kitchen', 'Waiter', 'Bartender')),
  hourly_rate DECIMAL(8,2) NOT NULL,
  availability BOOLEAN[], -- Array of 7 booleans for each day
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clock Records Table
CREATE TABLE clock_records (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  is_late BOOLEAN DEFAULT FALSE,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  geo_verified BOOLEAN DEFAULT FALSE,
  hours_worked DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMER FEEDBACK
-- ============================================

-- Feedback Table
CREATE TABLE feedback (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  loyalty_points_awarded INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications Table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('warning', 'alert', 'info', 'success')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

-- Audit Log Table
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prev_state TEXT,
  new_state TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Inventory indexes
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_expiry ON inventory_items(expiry_date);

-- Order indexes
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_timestamp ON orders(timestamp);
CREATE INDEX idx_orders_waiter ON orders(waiter);

-- Table indexes
CREATE INDEX idx_floor_tables_status ON floor_tables(status);
CREATE INDEX idx_floor_tables_waiter ON floor_tables(waiter);

-- Payment indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_timestamp ON payments(timestamp);

-- Staff indexes
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_clock_records_staff_id ON clock_records(staff_id);
CREATE INDEX idx_clock_records_clock_in ON clock_records(clock_in);

-- Purchase order indexes
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

-- Notification indexes
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp);

-- Audit log indexes
CREATE INDEX idx_audit_log_flow_id ON audit_log(flow_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- ============================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE clock_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_modifiers ENABLE ROW LEVEL SECURITY;

-- Basic policies (you'll need to customize these based on your auth requirements)
-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON floor_tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON clock_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON feedback FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON audit_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON customer_menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON item_modifiers FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_floor_tables_updated_at BEFORE UPDATE ON floor_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clock_records_updated_at BEFORE UPDATE ON clock_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_menu_items_updated_at BEFORE UPDATE ON customer_menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_modifiers_updated_at BEFORE UPDATE ON item_modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA INSERTIONS (Optional)
-- ============================================

-- Sample floor tables
INSERT INTO floor_tables (id, seats, status) VALUES 
(1, 4, 'vacant'),
(2, 2, 'vacant'),
(3, 6, 'vacant'),
(4, 4, 'vacant'),
(5, 8, 'vacant'),
(6, 2, 'vacant'),
(7, 4, 'vacant'),
(8, 4, 'vacant');

-- Sample staff
INSERT INTO staff (name, role, hourly_rate, availability) VALUES 
('John Smith', 'Manager', 25.00, ARRAY[true, true, true, true, true, false, false]),
('Sarah Johnson', 'Waiter', 15.00, ARRAY[true, true, true, true, false, false, false]),
('Mike Wilson', 'Kitchen', 18.00, ARRAY[true, true, true, true, true, false, false]),
('Emily Brown', 'Bartender', 16.00, ARRAY[false, false, true, true, true, true, false]);
