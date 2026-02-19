-- ============================================
-- INVENTORY QUERIES
-- ============================================

-- Get all inventory items
SELECT * FROM inventory_items ORDER BY category, name;

-- Get low stock items
SELECT * FROM inventory_items 
WHERE status IN ('LOW', 'CRITICAL') 
ORDER BY stock ASC;

-- Get items by category
SELECT * FROM inventory_items 
WHERE category = 'Food' 
ORDER BY name;

-- Update inventory stock
UPDATE inventory_items 
SET stock = stock - 10, version = version + 1
WHERE id = 'item-id-here' AND version = 1;

-- Add new inventory item
INSERT INTO inventory_items (name, stock, unit, reorder_point, category, status)
VALUES ('Tomatoes', 50, 'kg', 20, 'Food', 'OK');

-- Get items expiring soon
SELECT * FROM inventory_items 
WHERE expiry_date IS NOT NULL 
AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY expiry_date ASC;

-- Restock item
UPDATE inventory_items 
SET stock = stock + 100, status = 'OK'
WHERE id = 'item-id-here';

-- Get inventory summary by category
SELECT 
  category,
  COUNT(*) as total_items,
  SUM(stock) as total_stock,
  COUNT(CASE WHEN status = 'LOW' THEN 1 END) as low_stock_count,
  COUNT(CASE WHEN status = 'CRITICAL' THEN 1 END) as critical_stock_count
FROM inventory_items 
GROUP BY category 
ORDER BY category;
