# Supabase setup for Cognito CRM

This folder contains SQL to create and seed the database used by the app. The app uses **single-read fetches** and **Realtime subscriptions** for live updates (no polling).

## 1. Create tables

In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**, run in order:

1. **schema.sql** – creates all tables and indexes.
2. **rls.sql** – enables Row Level Security and adds policies (anon access for dev by default).
3. **seed.sql** – optional; inserts branches, floor tables, staff, inventory, suppliers, and menu items so the app works without mock data.

## 2. Enable Realtime

For live updates (orders, floor tables, inventory, notifications, etc.):

- Go to **Database** → **Replication**.
- Ensure the **supabase_realtime** publication includes (or add):
  - `orders`
  - `order_items`
  - `floor_tables`
  - `inventory_items`
  - `notifications`
  - `purchase_orders`
  - `clock_records`

## 3. App configuration

Set in `.env` (see project root):

- `VITE_SUPABASE_URL` – project URL from Supabase → Settings → API.
- `VITE_SUPABASE_ANON_KEY` – anon (publishable) key from the same page.

With these set, the app uses Supabase for data and real-time sync; without them it falls back to mock data.

## File summary

| File        | Purpose                                      |
|------------|-----------------------------------------------|
| schema.sql | Table definitions and indexes                 |
| rls.sql    | RLS policies (anon dev / authenticated prod) |
| seed.sql   | Minimal seed data for branches, tables, etc.   |
