# Supabase setup for Cognito CRM

This folder contains SQL and CLI config for the database. The app uses **single-read fetches** and **Realtime subscriptions** for live updates (no polling).

## Option A: Supabase CLI (recommended – login and db push)

1. **Login** (browser or token):
   ```bash
   npx supabase login
   ```
   Or set `SUPABASE_ACCESS_TOKEN` for CI.

2. **Link** your remote project (use the project ref from the dashboard URL, e.g. `mvbmddoralgqvztyxtbn`):
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   You’ll be prompted for the database password (Settings → Database).

3. **Push** migrations to the remote database:
   ```bash
   npx supabase db push
   ```

4. **Seed** the remote DB once (CLI does not run seed on push). In Dashboard → **SQL Editor**, run **seed.sql**, or run locally with `npx supabase db reset` (this resets the **local** DB and runs seed; for remote, run seed.sql manually).

## Option B: Manual SQL in Dashboard

In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**, run in order:

1. **schema.sql** – creates all tables and indexes.
2. **rls.sql** – enables RLS and anon policies.
3. **seed.sql** – inserts branches, floor tables, staff, inventory, suppliers, and menu items.

## Enable Realtime

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

| File / folder        | Purpose |
|----------------------|--------|
| config.toml          | Supabase CLI config (project_id, seed path) |
| migrations/          | Migrations applied by `supabase db push` (schema + RLS) |
| schema.sql           | Same as first migration; for manual run in SQL Editor |
| rls.sql              | Full RLS options; for manual run or reference |
| seed.sql             | Seed data (run manually after push, or on local `db reset`) |
