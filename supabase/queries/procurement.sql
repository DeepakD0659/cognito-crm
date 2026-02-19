-- ============================================
-- PROCUREMENT QUERIES
-- ============================================

-- Get all suppliers
SELECT * FROM suppliers 
ORDER BY rating DESC, name;

-- Get all purchase orders
SELECT 
  po.*,
  s.name as supplier_name,
  s.lead_time,
  s.rating
FROM purchase_orders po
LEFT JOIN suppliers s ON po.supplier_id = s.id
ORDER BY po.created_at DESC;

-- Get purchase orders by status
SELECT 
  po.*,
  s.name as supplier_name,
  s.lead_time
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
WHERE po.status = 'PENDING_APPROVAL'
ORDER BY po.created_at ASC;

-- Create new purchase order
INSERT INTO purchase_orders (
  items, 
  supplier_id, 
  supplier_name, 
  status, 
  approved_by
)
VALUES (
  '[{"inventoryId": "item1", "name": "Tomatoes", "quantity": 50, "unit": "kg"}]',
  'supplier-id-here',
  'Fresh Produce Co',
  'DRAFT',
  NULL
);

-- Get pending approvals
SELECT 
  po.*,
  s.name as supplier_name,
  s.rating,
  jsonb_array_length(po.items) as item_count,
  (SELECT SUM((item->>'quantity')::INTEGER * 10) -- Assuming avg price of 10 per unit
   FROM jsonb_array_elements(po.items) as item) as estimated_total
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
WHERE po.status = 'PENDING_APPROVAL'
ORDER BY po.created_at ASC;

-- Approve purchase order
UPDATE purchase_orders 
SET status = 'APPROVED', approved_by = 'John Smith'
WHERE id = 'po-id-here';

-- Mark as shipped
UPDATE purchase_orders 
SET status = 'SHIPPED'
WHERE id = 'po-id-here';

-- Receive purchase order (update inventory)
UPDATE purchase_orders 
SET status = 'RECEIVED', grn_number = 'GRN-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS')
WHERE id = 'po-id-here';

-- Get received orders for inventory update
SELECT 
  po.*,
  s.name as supplier_name,
  jsonb_array_elements(po.items) as item
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
WHERE po.status = 'RECEIVED'
AND po.grn_number IS NOT NULL;

-- Get procurement statistics by supplier
SELECT 
  s.name,
  s.rating,
  COUNT(po.id) as total_orders,
  COUNT(CASE WHEN po.status = 'RECEIVED' THEN 1 END) as completed_orders,
  AVG(
    (SELECT SUM((item->>'quantity')::INTEGER * 10)
     FROM jsonb_array_elements(po.items) as item)
  ) as avg_order_value
FROM suppliers s
LEFT JOIN purchase_orders po ON s.id = po.supplier_id
GROUP BY s.id, s.name, s.rating
ORDER BY completed_orders DESC, s.rating DESC;

-- Get low stock items for reordering
SELECT 
  ii.*,
  CASE 
    WHEN ii.stock <= ii.reorder_point THEN 'URGENT'
    WHEN ii.stock <= ii.reorder_point * 1.5 THEN 'SOON'
    ELSE 'MONITOR'
  END as reorder_priority
FROM inventory_items ii
WHERE ii.stock <= ii.reorder_point * 1.5
ORDER BY 
  CASE 
    WHEN ii.stock <= ii.reorder_point THEN 1
    WHEN ii.stock <= ii.reorder_point * 1.5 THEN 2
    ELSE 3
  END,
  ii.stock ASC;

-- Create purchase order from low stock
-- This would typically be done in application logic, but here's the SQL pattern
INSERT INTO purchase_orders (
  items,
  supplier_id,
  supplier_name,
  status
)
SELECT 
  jsonb_agg(
    json_build_object(
      'inventoryId', ii.id,
      'name', ii.name,
      'quantity', ii.reorder_point * 2 - ii.stock,
      'unit', ii.unit
    )
  ),
  'preferred-supplier-id',
  'Preferred Supplier',
  'DRAFT'
FROM inventory_items ii
WHERE ii.stock <= ii.reorder_point
GROUP BY 'preferred-supplier-id';

-- Get procurement timeline
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as earliest,
  MAX(created_at) as latest,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days_to_complete
FROM purchase_orders 
GROUP BY status
ORDER BY status;

-- Get supplier performance
SELECT 
  s.*,
  COUNT(po.id) as total_orders,
  COUNT(CASE WHEN po.status = 'RECEIVED' THEN 1 END) as delivered_orders,
  AVG(EXTRACT(EPOCH FROM (po.updated_at - po.created_at))/86400) as avg_delivery_days,
  COUNT(CASE WHEN po.status = 'RECEIVED' THEN 1 END)::FLOAT / COUNT(po.id) * 100 as delivery_rate
FROM suppliers s
LEFT JOIN purchase_orders po ON s.id = po.supplier_id
GROUP BY s.id, s.name, s.lead_time, s.rating, s.created_at, s.updated_at
ORDER BY delivery_rate DESC, s.rating DESC;

-- Add new supplier
INSERT INTO suppliers (name, lead_time, rating)
VALUES ('New Supplier Co', '3-5 days', 4.5);

-- Update supplier rating
UPDATE suppliers 
SET rating = 4.8
WHERE id = 'supplier-id-here';
