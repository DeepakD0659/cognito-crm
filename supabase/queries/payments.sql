-- ============================================
-- PAYMENTS QUERIES
-- ============================================

-- Get all payments
SELECT 
  p.*,
  o.table_id,
  o.waiter,
  jsonb_array_length(o.items) as item_count
FROM payments p
JOIN orders o ON p.order_id = o.id
ORDER BY p.timestamp DESC;

-- Get payments by status
SELECT * FROM payments 
WHERE status = 'COMPLETED'
ORDER BY timestamp DESC;

-- Get payments by method
SELECT 
  method,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM payments 
WHERE status = 'COMPLETED'
GROUP BY method
ORDER BY total_amount DESC;

-- Create new payment
INSERT INTO payments (order_id, table_id, method, amount, tip, status, receipt_id)
VALUES (
  'order-id-here',
  1,
  'CARD',
  45.99,
  5.00,
  'COMPLETED',
  'REC-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS')
);

-- Get payment statistics by date
SELECT 
  DATE(timestamp) as payment_date,
  COUNT(*) as payment_count,
  SUM(amount) as total_revenue,
  SUM(tip) as total_tips,
  AVG(amount) as avg_payment
FROM payments 
WHERE status = 'COMPLETED'
GROUP BY DATE(timestamp)
ORDER BY payment_date DESC;

-- Get payments by date range
SELECT * FROM payments 
WHERE DATE(timestamp) BETWEEN '2024-01-01' AND '2024-01-31'
AND status = 'COMPLETED'
ORDER BY timestamp DESC;

-- Get pending payments
SELECT 
  p.*,
  o.table_id,
  o.waiter,
  o.timestamp as order_time
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE p.status IN ('PENDING', 'PROCESSING')
ORDER BY p.timestamp ASC;

-- Update payment status
UPDATE payments 
SET status = 'COMPLETED'
WHERE id = 'payment-id-here';

-- Get split payment details
SELECT 
  p.*,
  o.table_id,
  jsonb_array_elements(p.split_details) as split_detail
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE p.split_details IS NOT NULL
AND p.status = 'COMPLETED';

-- Get payment by receipt ID
SELECT * FROM payments 
WHERE receipt_id = 'REC-20240119-143022';

-- Get daily revenue summary
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_transactions,
  SUM(amount) as gross_revenue,
  SUM(tip) as total_tips,
  SUM(amount + COALESCE(tip, 0)) as net_revenue,
  COUNT(CASE WHEN method = 'CARD' THEN 1 END) as card_payments,
  COUNT(CASE WHEN method = 'CASH' THEN 1 END) as cash_payments,
  COUNT(CASE WHEN method = 'E_WALLET' THEN 1 END) as ewallet_payments
FROM payments 
WHERE status = 'COMPLETED'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Get payment by order
SELECT * FROM payments 
WHERE order_id = 'order-id-here'
ORDER BY timestamp DESC;
