-- ============================================
-- STAFF QUERIES
-- ============================================

-- Get all staff
SELECT * FROM staff 
ORDER BY role, name;

-- Get staff by role
SELECT * FROM staff 
WHERE role = 'Waiter'
ORDER BY name;

-- Add new staff member
INSERT INTO staff (name, role, hourly_rate, availability)
VALUES ('Jane Doe', 'Waiter', 15.50, ARRAY[true, true, true, true, false, false, false]);

-- Get staff availability for today (assuming today is day 0 = Monday)
SELECT 
  id,
  name,
  role,
  hourly_rate,
  availability[1] as monday,
  availability[2] as tuesday,
  availability[3] as wednesday,
  availability[4] as thursday,
  availability[5] as friday,
  availability[6] as saturday,
  availability[7] as sunday
FROM staff 
ORDER BY role, name;

-- Get clock records for today
SELECT 
  cr.*,
  s.role,
  s.hourly_rate,
  EXTRACT(EPOCH FROM (COALESCE(cr.clock_out, NOW()) - cr.clock_in))/3600 as hours_worked_calculated
FROM clock_records cr
JOIN staff s ON cr.staff_id = s.id
WHERE DATE(cr.clock_in) = CURRENT_DATE
ORDER BY cr.clock_in DESC;

-- Clock in staff
INSERT INTO clock_records (staff_id, staff_name, clock_in, is_late, scheduled_start, geo_verified)
VALUES (
  'staff-id-here',
  'John Smith',
  NOW(),
  false,
  '2024-01-19 09:00:00',
  true
);

-- Clock out staff
UPDATE clock_records 
SET clock_out = NOW(),
  hours_worked = EXTRACT(EPOCH FROM (NOW() - clock_in))/3600
WHERE id = 'clock-record-id-here' AND clock_out IS NULL;

-- Get active clock records (staff currently working)
SELECT 
  cr.*,
  s.role,
  EXTRACT(EPOCH FROM (NOW() - cr.clock_in))/3600 as current_hours
FROM clock_records cr
JOIN staff s ON cr.staff_id = s.id
WHERE cr.clock_out IS NULL
ORDER BY cr.clock_in ASC;

-- Get staff payroll summary for period
SELECT 
  s.id,
  s.name,
  s.role,
  s.hourly_rate,
  COUNT(cr.id) as days_worked,
  SUM(cr.hours_worked) as total_hours,
  SUM(cr.hours_worked * s.hourly_rate) as base_pay,
  SUM(CASE WHEN cr.is_late THEN cr.hours_worked * s.hourly_rate * 0.1 ELSE 0 END) as late_deductions,
  SUM(cr.hours_worked * s.hourly_rate) - SUM(CASE WHEN cr.is_late THEN cr.hours_worked * s.hourly_rate * 0.1 ELSE 0 END) as net_pay
FROM staff s
LEFT JOIN clock_records cr ON s.id = cr.staff_id
WHERE DATE(cr.clock_in) BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY s.id, s.name, s.role, s.hourly_rate
ORDER BY s.role, s.name;

-- Get late arrivals for period
SELECT 
  cr.*,
  s.name,
  s.role,
  EXTRACT(EPOCH FROM (cr.clock_in - cr.scheduled_start))/60 as minutes_late
FROM clock_records cr
JOIN staff s ON cr.staff_id = s.id
WHERE cr.is_late = true
AND DATE(cr.clock_in) BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY cr.clock_in DESC;

-- Get staff performance metrics
SELECT 
  s.name,
  s.role,
  COUNT(DISTINCT o.id) as orders_served,
  AVG(
    (SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) 
     FROM jsonb_array_elements(o.items) as item)
  ) as avg_order_value,
  COUNT(DISTINCT DATE(o.timestamp)) as days_worked
FROM staff s
LEFT JOIN orders o ON s.name = o.waiter
WHERE DATE(o.timestamp) BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY s.id, s.name, s.role
ORDER BY orders_served DESC;

-- Update staff availability
UPDATE staff 
SET availability = ARRAY[true, true, true, true, true, false, false]
WHERE id = 'staff-id-here';

-- Get staff on duty now
SELECT DISTINCT s.*
FROM staff s
JOIN clock_records cr ON s.id = cr.staff_id
WHERE cr.clock_out IS NULL
AND s.availability[EXTRACT(DOW FROM CURRENT_DATE) + 1] = true
ORDER BY s.role, s.name;
