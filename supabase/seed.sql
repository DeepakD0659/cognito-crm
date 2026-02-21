-- ============================================
-- Minimal seed data – run after schema.sql (and rls.sql if using RLS)
-- Ensures the app has branches, floor tables, and optional reference data.
-- ============================================

-- Branches (matches app BranchId)
INSERT INTO public.branches (id, name, performance_score) VALUES
  ('branch-a', 'Downtown Flagship', 92),
  ('branch-b', 'Mall Outlet', 64)
ON CONFLICT (id) DO NOTHING;

-- Floor tables (12 tables, seats 2–8)
INSERT INTO public.floor_tables (id, seats, status)
SELECT n, (ARRAY[2,4,2,6,4,8,2,4,4,2,6,4])[n], 'vacant'
FROM generate_series(1, 12) AS n
ON CONFLICT (id) DO NOTHING;

-- Suppliers
INSERT INTO public.suppliers (id, name, lead_time, rating) VALUES
  ('sup-1', 'FreshFarm Co.', '1-2 days', 4.8),
  ('sup-2', 'Ocean Harvest', '2-3 days', 4.5),
  ('sup-3', 'Metro Wholesale', 'Same day', 4.2),
  ('sup-4', 'Premium Meats Ltd.', '1 day', 4.9)
ON CONFLICT (id) DO NOTHING;

-- Staff
INSERT INTO public.staff (id, name, role, hourly_rate, availability) VALUES
  ('staff-1', 'Sarah Chen', 'Waiter', 15, ARRAY[true,true,false,true,true,true,false]),
  ('staff-2', 'James Wilson', 'Waiter', 15, ARRAY[true,true,true,true,false,true,true]),
  ('staff-3', 'Mike Rodriguez', 'Waiter', 15, ARRAY[false,true,true,true,true,false,true]),
  ('staff-4', 'Deepak Sharma', 'Kitchen', 18, array_fill(true, ARRAY[7])),
  ('staff-5', 'Aisha Patel', 'Kitchen', 18, ARRAY[true,false,true,true,true,true,true]),
  ('staff-6', 'Tom Baker', 'Bartender', 16, ARRAY[false,true,true,true,true,true,true]),
  ('staff-7', 'Lisa Nguyen', 'Manager', 25, ARRAY[true,true,true,true,true,false,false])
ON CONFLICT (id) DO NOTHING;

-- Inventory (minimal set for POS/recipes)
INSERT INTO public.inventory_items (id, name, stock, unit, reorder_point, expiry_date, status, category, version) VALUES
  ('inv-1', 'Beef Patty', 45, 'pcs', 50, '2026-02-20', 'LOW', 'Protein', 1),
  ('inv-2', 'Brioche Bun', 120, 'pcs', 40, '2026-02-18', 'OK', 'Bakery', 1),
  ('inv-3', 'Truffle Oil', 3, 'bottles', 5, '2026-06-01', 'CRITICAL', 'Condiments', 1),
  ('inv-4', 'Lettuce', 25, 'heads', 15, '2026-02-17', 'OK', 'Produce', 1),
  ('inv-5', 'Wagyu Beef', 8, 'kg', 10, '2026-02-19', 'LOW', 'Protein', 1),
  ('inv-6', 'French Fries', 200, 'portions', 50, '2026-04-15', 'OK', 'Sides', 1),
  ('inv-7', 'Lobster Tail', 4, 'pcs', 8, '2026-02-16', 'CRITICAL', 'Seafood', 1),
  ('inv-8', 'Craft Beer', 72, 'bottles', 24, '2026-08-01', 'OK', 'Beverages', 1),
  ('inv-9', 'Matcha Powder', 12, 'bags', 5, '2026-09-01', 'OK', 'Beverages', 1),
  ('inv-10', 'Cheddar Cheese', 6, 'kg', 8, '2026-02-22', 'LOW', 'Dairy', 1)
ON CONFLICT (id) DO NOTHING;

-- Menu items (customer-facing)
INSERT INTO public.menu_items (id, name, description, price, image, category, popular, available_modifiers) VALUES
  ('cm-1', 'Truffle Burger', 'Premium beef patty with truffle aioli, aged cheddar, and brioche bun', 24.90, '🍔', 'Burgers', true, '[{"id":"mod-1","label":"No Onions","price":0},{"id":"mod-2","label":"Extra Cheese","price":2},{"id":"mod-3","label":"Add Bacon","price":3}]'::jsonb),
  ('cm-2', 'Wagyu Steak', 'A5 Wagyu with roasted vegetables and red wine jus', 58.00, '🥩', 'Mains', true, '[]'::jsonb),
  ('cm-3', 'Lobster Roll', 'Fresh lobster in buttered roll with lemon herb mayo', 32.00, '🦞', 'Seafood', true, '[]'::jsonb),
  ('cm-4', 'Caesar Salad', 'Crisp romaine, parmesan, croutons, house-made dressing', 14.00, '🥗', 'Salads', false, '[]'::jsonb),
  ('cm-5', 'Loaded Fries', 'Truffle oil, parmesan, herbs', 9.50, '🍟', 'Sides', false, '[]'::jsonb),
  ('cm-6', 'Fusion Tacos', 'Korean BBQ pulled pork with kimchi slaw', 16.00, '🌮', 'Specials', false, '[{"id":"mod-4","label":"Extra Spicy","price":0},{"id":"mod-5","label":"Add Avocado","price":2.5}]'::jsonb),
  ('cm-7', 'Fish & Chips', 'Beer-battered cod with tartar sauce and mushy peas', 18.00, '🐟', 'Mains', false, '[]'::jsonb),
  ('cm-8', 'Craft Beer', 'Local IPA on tap', 12.00, '🍺', 'Drinks', false, '[]'::jsonb),
  ('cm-9', 'Matcha Latte', 'Organic ceremonial grade matcha', 8.50, '🍵', 'Drinks', true, '[]'::jsonb),
  ('cm-10', 'Mushroom Soup', 'Wild mushroom velouté with truffle cream', 12.00, '🍲', 'Starters', false, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
