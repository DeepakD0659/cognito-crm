-- ============================================
-- Cognito CRM – Supabase schema
-- Run in Supabase Dashboard → SQL Editor (or via Supabase CLI).
-- Enable Realtime: Database → Replication → add these tables to the publication.
-- ============================================

-- BRANCHES
CREATE TABLE IF NOT EXISTS public.branches (
  id text PRIMARY KEY,
  name text NOT NULL,
  performance_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
  id text PRIMARY KEY,
  name text NOT NULL,
  lead_time text,
  rating numeric(3,2),
  created_at timestamptz DEFAULT now()
);

-- STAFF
CREATE TABLE IF NOT EXISTS public.staff (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Manager', 'Kitchen', 'Waiter', 'Bartender')),
  hourly_rate numeric(10,2) NOT NULL,
  availability boolean[] DEFAULT array_fill(true, ARRAY[7]),
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INVENTORY ITEMS
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  stock numeric(12,2) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  reorder_point numeric(12,2) NOT NULL DEFAULT 0,
  expiry_date date,
  status text NOT NULL CHECK (status IN ('OK', 'LOW', 'CRITICAL')),
  category text,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FLOOR TABLES
CREATE TABLE IF NOT EXISTS public.floor_tables (
  id int PRIMARY KEY,
  seats int NOT NULL,
  status text NOT NULL CHECK (status IN ('vacant', 'occupied', 'reserved', 'alert')),
  order_id text,
  waiter text,
  occupied_since timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  table_id int NOT NULL REFERENCES public.floor_tables(id),
  status text NOT NULL CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED')),
  route text NOT NULL CHECK (route IN ('KITCHEN', 'BAR', 'BOTH')),
  waiter text,
  guest_count int,
  locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  category text NOT NULL CHECK (category IN ('FOOD', 'DRINK')),
  image text,
  modifiers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- SHIFT SLOTS (rostering)
CREATE TABLE IF NOT EXISTS public.shift_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day int NOT NULL CHECK (day >= 0 AND day <= 6),
  shift text NOT NULL CHECK (shift IN ('morning', 'afternoon', 'evening')),
  conflict text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, day, shift)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('warning', 'alert', 'info', 'success')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- MENU ITEMS (customer-facing)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image text,
  category text NOT NULL,
  popular boolean DEFAULT false,
  upsell_items text[] DEFAULT '{}',
  available_modifiers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id text PRIMARY KEY,
  supplier_id text NOT NULL REFERENCES public.suppliers(id),
  supplier_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SHIPPED', 'RECEIVED')),
  approved_by text,
  grn_number text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CLOCK RECORDS (attendance)
CREATE TABLE IF NOT EXISTS public.clock_records (
  id text PRIMARY KEY,
  staff_id text NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  staff_name text NOT NULL,
  clock_in timestamptz NOT NULL,
  clock_out timestamptz,
  is_late boolean DEFAULT false,
  scheduled_start timestamptz,
  geo_verified boolean DEFAULT false,
  hours_worked numeric(5,2),
  created_at timestamptz DEFAULT now()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id),
  table_id int NOT NULL,
  method text NOT NULL CHECK (method IN ('CASH', 'CARD', 'E_WALLET')),
  amount numeric(12,2) NOT NULL,
  tip numeric(10,2),
  status text NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  split_details jsonb,
  receipt_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
  id text PRIMARY KEY,
  order_id text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  loyalty_points_awarded int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common filters and realtime
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_floor_tables_status ON public.floor_tables(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clock_records_clock_in ON public.clock_records(clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON public.purchase_orders(created_at DESC);
