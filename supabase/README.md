# Supabase Database Setup for CRM

This folder contains all the SQL queries and schema files needed to set up and manage your CRM database in Supabase.

## 📁 File Structure

```
supabase/
├── schema.sql              # Complete database schema
├── queries/
│   ├── inventory.sql       # Inventory management queries
│   ├── orders.sql          # Order management queries
│   ├── tables.sql          # Floor table queries
│   ├── payments.sql        # Payment processing queries
│   ├── staff.sql           # Staff management queries
│   ├── procurement.sql     # Purchase order queries
│   └── reports.sql         # Analytics and reports
└── README.md               # This file
```

## 🚀 Quick Setup

### 1. Execute Schema
1. Go to your Supabase dashboard: https://mvbmdoralgqvztyxtbn.supabase.co
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and execute to create all tables

### 2. Verify Tables
Check that all 13 tables are created:
- `inventory_items`
- `suppliers`
- `orders`
- `floor_tables`
- `item_modifiers`
- `customer_menu_items`
- `payments`
- `purchase_orders`
- `staff`
- `clock_records`
- `feedback`
- `notifications`
- `audit_log`

## 📋 Query Categories

### 📦 Inventory Management (`inventory.sql`)
- Get all inventory items
- Find low stock items
- Update stock levels
- Category-based queries
- Expiry tracking

### 🛒 Order Management (`orders.sql`)
- Active orders
- Order by table/status
- Create new orders
- Order statistics
- Order locking for billing

### 🪑 Floor Tables (`tables.sql`)
- Table status management
- Occupied/vacant tables
- Table assignments
- Floor layout analysis
- Reservation management

### 💳 Payments (`payments.sql`)
- Payment processing
- Revenue tracking
- Payment method analysis
- Split payments
- Daily revenue reports

### 👥 Staff Management (`staff.sql`)
- Staff records
- Clock in/out
- Payroll calculations
- Performance metrics
- Availability management

### 📋 Procurement (`procurement.sql`)
- Supplier management
- Purchase orders
- Approval workflows
- Inventory restocking
- Supplier performance

### 📊 Reports (`reports.sql`)
- Daily/monthly sales
- Menu performance
- Peak hours analysis
- Staff performance
- Customer feedback

## 🔧 Common Operations

### Sample Data Insertion
```sql
-- Add sample tables
INSERT INTO floor_tables (id, seats, status) VALUES 
(1, 4, 'vacant'),
(2, 2, 'vacant'),
(3, 6, 'vacant');

-- Add sample staff
INSERT INTO staff (name, role, hourly_rate, availability) VALUES 
('John Smith', 'Manager', 25.00, ARRAY[true, true, true, true, true, false, false]);
```

### Real-time Subscriptions
```javascript
// Example: Listen for new orders
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => console.log('New order:', payload)
  )
  .subscribe()
```

## 🔐 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Default policies allow authenticated users full access
- **Customize RLS policies** based on your role requirements
- Consider implementing proper authentication

## 📈 Performance Tips

- All tables have appropriate indexes
- Use the provided optimized queries
- Consider materialized views for complex reports
- Monitor query performance in Supabase dashboard

## 🔄 Next Steps

1. **Execute the schema** in Supabase dashboard
2. **Test with sample data**
3. **Customize RLS policies** for your security needs
4. **Update your application** to use these queries
5. **Set up real-time subscriptions** for live updates

## 🛠️ Application Integration

Use the queries in these files to replace your mock data operations in:
- `src/store/useAppStore.ts`
- `src/lib/` helper functions
- Component data fetching

Each query file contains ready-to-use SQL statements for common CRM operations.
