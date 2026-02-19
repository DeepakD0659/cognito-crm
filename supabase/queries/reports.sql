-- ============================================
-- REPORTS AND ANALYTICS QUERIES
-- ============================================

-- Daily Sales Report
SELECT 
  DATE(o.timestamp) as report_date,
  COUNT(o.id) as total_orders,
  COUNT(DISTINCT o.table_id) as tables_served,
  SUM(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as gross_revenue,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value,
  COUNT(DISTINCT o.waiter) as staff_working
FROM orders o
WHERE o.status = 'SERVED'
GROUP BY DATE(o.timestamp)
ORDER BY report_date DESC;

-- Monthly Performance Report
SELECT 
  DATE_TRUNC('month', o.timestamp) as report_month,
  COUNT(o.id) as total_orders,
  SUM(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as gross_revenue,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value,
  COUNT(DISTINCT o.table_id) as unique_tables,
  COUNT(DISTINCT o.waiter) as staff_count
FROM orders o
WHERE o.status = 'SERVED'
GROUP BY DATE_TRUNC('month', o.timestamp)
ORDER BY report_month DESC;

-- Menu Item Performance
SELECT 
  cmi.name,
  cmi.category,
  cmi.price,
  COUNT(DISTINCT o.id) as times_ordered,
  SUM(
    (item->>'quantity')::INTEGER
  ) as total_quantity,
  SUM(
    (item->>'price')::DECIMAL * (item->>'quantity')::INTEGER
  ) as total_revenue,
  AVG(
    (item->>'price')::DECIMAL * (item->>'quantity')::INTEGER
  ) as avg_revenue_per_order
FROM customer_menu_items cmi
JOIN orders o ON EXISTS (
  SELECT 1 FROM jsonb_array_elements(o.items) as item 
  WHERE item->>'id' = cmi.id
)
WHERE o.status = 'SERVED'
GROUP BY cmi.id, cmi.name, cmi.category, cmi.price
ORDER BY total_revenue DESC;

-- Category Performance
SELECT 
  cmi.category,
  COUNT(DISTINCT o.id) as orders_in_category,
  COUNT(DISTINCT cmi.id) as unique_items,
  SUM(
    (item->>'price')::DECIMAL * (item->>'quantity')::INTEGER
  ) as category_revenue,
  SUM(
    (item->>'quantity')::INTEGER
  ) as total_items_sold
FROM customer_menu_items cmi
JOIN orders o ON EXISTS (
  SELECT 1 FROM jsonb_array_elements(o.items) as item 
  WHERE item->>'id' = cmi.id
)
WHERE o.status = 'SERVED'
GROUP BY cmi.category
ORDER BY category_revenue DESC;

-- Peak Hours Analysis
SELECT 
  EXTRACT(HOUR FROM o.timestamp) as hour_of_day,
  COUNT(o.id) as order_count,
  COUNT(DISTINCT o.table_id) as tables_occupied,
  SUM(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as hourly_revenue,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value
FROM orders o
WHERE o.status = 'SERVED'
GROUP BY EXTRACT(HOUR FROM o.timestamp)
ORDER BY hour_of_day;

-- Table Performance
SELECT 
  ft.id as table_number,
  ft.seats,
  COUNT(o.id) as total_orders,
  SUM(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as total_revenue,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value,
  AVG(EXTRACT(EPOCH FROM (o.updated_at - o.timestamp))/3600) as avg_duration_hours
FROM floor_tables ft
LEFT JOIN orders o ON ft.id = o.table_id AND o.status = 'SERVED'
GROUP BY ft.id, ft.seats
ORDER BY total_revenue DESC;

-- Staff Performance Report
SELECT 
  s.name,
  s.role,
  COUNT(o.id) as orders_served,
  COUNT(DISTINCT o.table_id) as tables_served,
  SUM(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as total_revenue,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value,
  COUNT(DISTINCT DATE(o.timestamp)) as days_worked
FROM staff s
LEFT JOIN orders o ON s.name = o.waiter AND o.status = 'SERVED'
GROUP BY s.id, s.name, s.role
ORDER BY total_revenue DESC;

-- Payment Method Analysis
SELECT 
  p.method,
  COUNT(p.id) as transaction_count,
  SUM(p.amount) as total_amount,
  AVG(p.amount) as avg_transaction,
  SUM(p.tip) as total_tips,
  AVG(p.tip) as avg_tip,
  SUM(p.amount + COALESCE(p.tip, 0)) as gross_revenue
FROM payments p
WHERE p.status = 'COMPLETED'
GROUP BY p.method
ORDER BY total_amount DESC;

-- Customer Feedback Summary
SELECT 
  AVG(f.rating) as avg_rating,
  COUNT(f.id) as total_feedback,
  COUNT(CASE WHEN f.rating >= 4 THEN 1 END) as positive_feedback,
  COUNT(CASE WHEN f.rating = 3 THEN 1 END) as neutral_feedback,
  COUNT(CASE WHEN f.rating <= 2 THEN 1 END) as negative_feedback,
  SUM(f.loyalty_points_awarded) as total_points_awarded
FROM feedback f;

-- Inventory Turnover Report
SELECT 
  ii.category,
  ii.name,
  ii.stock,
  ii.reorder_point,
  ii.status,
  CASE 
    WHEN ii.stock = 0 THEN 'OUT OF STOCK'
    WHEN ii.stock <= ii.reorder_point THEN 'CRITICAL'
    WHEN ii.stock <= ii.reorder_point * 1.5 THEN 'LOW'
    ELSE 'ADEQUATE'
  END as stock_status
FROM inventory_items ii
ORDER BY 
  CASE 
    WHEN ii.stock = 0 THEN 1
    WHEN ii.stock <= ii.reorder_point THEN 2
    WHEN ii.stock <= ii.reorder_point * 1.5 THEN 3
    ELSE 4
  END,
  ii.category, ii.name;

-- Daily Revenue vs Tips
SELECT 
  DATE(p.timestamp) as report_date,
  SUM(p.amount) as revenue,
  SUM(p.tip) as tips,
  SUM(p.amount + COALESCE(p.tip, 0)) as total_revenue,
  ROUND((SUM(p.tip) / SUM(p.amount)) * 100, 2) as tip_percentage
FROM payments p
WHERE p.status = 'COMPLETED'
GROUP BY DATE(p.timestamp)
ORDER BY report_date DESC;

-- Order Status Distribution
SELECT 
  o.status,
  COUNT(o.id) as order_count,
  COUNT(DISTINCT o.table_id) as affected_tables,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value
FROM orders o
GROUP BY o.status
ORDER BY order_count DESC;
