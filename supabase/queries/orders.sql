-- ============================================
-- ORDERS QUERIES
-- ============================================

-- Get all active orders
SELECT * FROM orders 
WHERE status IN ('PENDING', 'PREPARING', 'READY')
ORDER BY timestamp ASC;

-- Get orders by table
SELECT o.*, ft.seats, ft.waiter as table_waiter
FROM orders o
JOIN floor_tables ft ON o.table_id = ft.id
WHERE o.table_id = 1
ORDER BY o.timestamp DESC;

-- Get orders by status
SELECT * FROM orders 
WHERE status = 'PENDING'
ORDER BY timestamp ASC;

-- Create new order
INSERT INTO orders (table_id, items, status, waiter, route, guest_count)
VALUES (
  1, 
  '[{"id": "item1", "name": "Burger", "price": 12.99, "quantity": 2, "category": "FOOD"}]',
  'PENDING',
  'John Smith',
  'KITCHEN',
  4
);

-- Update order status
UPDATE orders 
SET status = 'PREPARING'
WHERE id = 'order-id-here';

-- Get order with items details
SELECT 
  o.id,
  o.table_id,
  o.status,
  o.timestamp,
  o.waiter,
  o.guest_count,
  jsonb_array_length(o.items) as item_count,
  (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
   FROM jsonb_array_elements(o.items) as item) as total_amount
FROM orders o
WHERE o.id = 'order-id-here';

-- Get orders by date range
SELECT * FROM orders 
WHERE DATE(timestamp) BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY timestamp DESC;

-- Get orders by waiter
SELECT * FROM orders 
WHERE waiter = 'John Smith'
ORDER BY timestamp DESC;

-- Lock order for billing
UPDATE orders 
SET locked = true
WHERE id = 'order-id-here';

-- Get order statistics by status
SELECT 
  status,
  COUNT(*) as order_count,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(items) as item)
  ) as avg_order_value
FROM orders 
GROUP BY status
ORDER BY status;
