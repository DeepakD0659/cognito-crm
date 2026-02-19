-- ============================================
-- FLOOR TABLES QUERIES
-- ============================================

-- Get all floor tables with order info
SELECT 
  ft.id,
  ft.seats,
  ft.status,
  ft.waiter,
  ft.occupied_since,
  o.id as order_id,
  o.status as order_status,
  o.timestamp as order_time,
  jsonb_array_length(o.items) as item_count
FROM floor_tables ft
LEFT JOIN orders o ON ft.order_id = o.id
ORDER BY ft.id;

-- Get vacant tables
SELECT * FROM floor_tables 
WHERE status = 'vacant'
ORDER BY seats, id;

-- Get occupied tables
SELECT 
  ft.*,
  o.timestamp as occupied_time,
  EXTRACT(EPOCH FROM (NOW() - o.timestamp))/60 as minutes_occupied,
  jsonb_array_length(o.items) as item_count
FROM floor_tables ft
JOIN orders o ON ft.order_id = o.id
WHERE ft.status = 'occupied'
ORDER BY o.timestamp ASC;

-- Update table status
UPDATE floor_tables 
SET status = 'occupied', order_id = 'order-id-here', waiter = 'John Smith', occupied_since = NOW()
WHERE id = 1;

-- Free table
UPDATE floor_tables 
SET status = 'vacant', order_id = NULL, waiter = NULL, occupied_since = NULL
WHERE id = 1;

-- Get tables by waiter
SELECT * FROM floor_tables 
WHERE waiter = 'John Smith' AND status = 'occupied'
ORDER BY id;

-- Get table status summary
SELECT 
  status,
  COUNT(*) as table_count,
  SUM(seats) as total_seats
FROM floor_tables 
GROUP BY status
ORDER BY status;

-- Get tables that need attention (occupied for more than 60 minutes)
SELECT 
  ft.*,
  o.timestamp as order_time,
  EXTRACT(EPOCH FROM (NOW() - o.timestamp))/60 as minutes_occupied
FROM floor_tables ft
JOIN orders o ON ft.order_id = o.id
WHERE ft.status = 'occupied' 
AND EXTRACT(EPOCH FROM (NOW() - o.timestamp))/60 > 60
ORDER BY minutes_occupied DESC;

-- Reserve table
UPDATE floor_tables 
SET status = 'reserved'
WHERE id = 1;

-- Get floor layout summary
SELECT 
  CASE 
    WHEN id <= 3 THEN 'Section A'
    WHEN id <= 6 THEN 'Section B'
    ELSE 'Section C'
  END as section,
  COUNT(*) as total_tables,
  SUM(seats) as total_seats,
  COUNT(CASE WHEN status = 'vacant' THEN 1 END) as vacant_tables,
  COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_tables,
  COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_tables
FROM floor_tables 
GROUP BY CASE 
  WHEN id <= 3 THEN 'Section A'
  WHEN id <= 6 THEN 'Section B'
  ELSE 'Section C'
END
ORDER BY section;
