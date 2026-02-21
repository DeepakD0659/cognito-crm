-- ============================================
-- Row Level Security (RLS) – run after schema.sql
-- Choose one option below depending on your auth setup.
-- ============================================

-- Enable RLS on all app tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clock_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- OPTION A: Authenticated users only (recommended when using Supabase Auth)
-- Uncomment the block below and comment OPTION B if you use signInWithPassword / signUp.
-- --------------------------------------------
/*
CREATE POLICY "Authenticated read/write branches" ON public.branches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write suppliers" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write staff" ON public.staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write inventory_items" ON public.inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write floor_tables" ON public.floor_tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write order_items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write shift_slots" ON public.shift_slots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write notifications" ON public.notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write menu_items" ON public.menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write purchase_orders" ON public.purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write clock_records" ON public.clock_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read/write feedback" ON public.feedback FOR ALL USING (auth.role() = 'authenticated');
*/

-- --------------------------------------------
-- OPTION B: Anon full access (dev only – no auth required)
-- Use this so the app works with anon key before you add Supabase Auth.
-- Do NOT use in production.
-- --------------------------------------------
CREATE POLICY "Anon full access branches" ON public.branches FOR ALL USING (true);
CREATE POLICY "Anon full access suppliers" ON public.suppliers FOR ALL USING (true);
CREATE POLICY "Anon full access staff" ON public.staff FOR ALL USING (true);
CREATE POLICY "Anon full access inventory_items" ON public.inventory_items FOR ALL USING (true);
CREATE POLICY "Anon full access floor_tables" ON public.floor_tables FOR ALL USING (true);
CREATE POLICY "Anon full access orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Anon full access order_items" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Anon full access shift_slots" ON public.shift_slots FOR ALL USING (true);
CREATE POLICY "Anon full access notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Anon full access menu_items" ON public.menu_items FOR ALL USING (true);
CREATE POLICY "Anon full access purchase_orders" ON public.purchase_orders FOR ALL USING (true);
CREATE POLICY "Anon full access clock_records" ON public.clock_records FOR ALL USING (true);
CREATE POLICY "Anon full access payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Anon full access feedback" ON public.feedback FOR ALL USING (true);
