

# MH Cognition ERP -- 8-Flow Workflow Engine Implementation Plan

## Overview

This plan enhances the existing MH Cognition ERP frontend with a production-grade workflow engine covering 8 interconnected operational flows. Since this is Phase 1 (no real backend), all state machines, event buses, and async patterns are implemented client-side using Zustand, custom event emitters, and simulated delays.

---

## Architecture Design

### Core Infrastructure (3 new files)

**1. Event Bus (`src/lib/eventBus.ts`)**
A typed publish/subscribe system that decouples flows. When an order is bumped in KDS, the event bus emits `ORDER_SERVED`, which the Recipe Engine (Flow 4) listens to asynchronously -- never blocking the KDS UI.

Events: `ORDER_PLACED`, `ORDER_STATUS_CHANGED`, `ORDER_SERVED`, `INVENTORY_DEDUCTED`, `LOW_STOCK_DETECTED`, `PAYMENT_COMPLETED`, `FEEDBACK_SUBMITTED`, `SHIFT_CLOCKED_IN`, `TABLE_STATUS_CHANGED`

**2. Flow State Machine (`src/lib/flowStateMachine.ts`)**
A lightweight, generic state machine utility (no XState dependency -- keeps bundle small). Each flow defines its states, transitions, guards, and side-effects as plain objects. Includes error states and recovery paths for every flow.

**3. Audit Logger (`src/lib/auditLog.ts`)**
An in-memory audit trail that logs every state transition with timestamp, actor, flow ID, previous state, new state, and metadata. Viewable in a new "Audit Log" panel on the Dashboard.

### Enhanced Types (`src/types.ts` additions)

New interfaces added:
- `Payment` (method, amount, status, splitDetails, receiptId)
- `PurchaseOrder` (items, supplier, status, approvedBy, grnNumber)
- `ClockRecord` (staffId, clockIn, clockOut, isLate, geoLocation)
- `Feedback` (orderId, rating, comment, loyaltyPointsAwarded)
- `AuditEntry` (flowId, action, actor, timestamp, prevState, newState, metadata)
- `FlowState<T>` generic for state machine instances
- Order modifiers support (e.g., "no onions", "extra cheese")

### Enhanced Store (`src/store/useAppStore.ts` updates)

New state slices and actions:
- `payments: Payment[]` + `processPayment`, `splitBill`
- `purchaseOrders: PurchaseOrder[]` + `createPO`, `approvePO`, `receiveGoods`
- `clockRecords: ClockRecord[]` + `clockIn`, `clockOut`
- `feedbackRecords: Feedback[]` + `submitFeedback`
- `auditLog: AuditEntry[]` + `logAudit`
- Concurrency guard: `lockedTables: Set<number>` to prevent double-billing
- Inventory optimistic lock: version counter on each `InventoryItem`

---

## Flow Implementation Details

### Flow 1: Customer Digital Journey (Enhanced `Customer.tsx`)
- Add item modifier UI (checkboxes for customizations like "No Onions")
- Add login check step before checkout (mock auth modal)
- Add discount/promo code input field
- Payment method selection (Cash, Card, E-Wallet -- all mocked)
- On order placement: emit `ORDER_PLACED` event, push to KDS via store

### Flow 2: POS Operations (New `src/pages/POS.tsx`)
- New dedicated POS page for waitstaff workflow
- Waiter login simulation (select from staff list)
- Table selection from floor map (reuse existing grid)
- Guest count input
- Item punch interface with real-time stock check (show warning if stock low)
- "Fire KOT" button that routes items to Kitchen/Bar based on category
- Updates table status to occupied automatically
- Add route `/pos` and menu item for MANAGER/ADMIN roles

### Flow 3: KDS Routing (Enhanced `KDS.tsx`)
- Add simulated WebSocket-like behavior using `useEffect` + event bus subscription
- New order flash animation (green border pulse on arrival)
- Chef state change buttons: Pending -> Cooking -> Ready (not just bump)
- "Ready" state triggers a waiter notification toast
- Add Dessert station section (items with `category: 'DESSERT'`)
- Sound indicator icon (muted by default) for new orders

### Flow 4: Recipe Engine (New `src/lib/recipeEngine.ts`)
- Recipe lookup map: each menu item mapped to ingredient quantities
- Executes asynchronously via `setTimeout` (never blocks POS/KDS)
- On `ORDER_SERVED` event: look up recipe, deduct ingredients, check reorder points
- If stock falls below reorder point: emit `LOW_STOCK_DETECTED`, create notification
- Toast notification showing deducted items (e.g., "-1 Bun, -1 Patty")
- Prevents negative stock (caps at 0, shows warning)

### Flow 5: Procurement (Enhanced `Inventory.tsx`)
- Add approval gate step to restock wizard (Manager must "approve")
- Add mock vendor email step (shows email preview with PO details)
- Add Goods Receipt Note (GRN) generation step after "delivery"
- GRN auto-updates live inventory on confirmation
- New PO status tracking: Draft -> Pending Approval -> Approved -> Shipped -> Received
- Purchase Order history table below inventory

### Flow 6: Table Turnover (Enhanced `Operations.tsx`)
- "Request Bill" button on occupied tables
- Bill print preview modal (itemized receipt)
- Order lock mechanism (prevents modifications after bill requested)
- Split bill UI: split evenly or by item selection
- Payment processing simulation with success animation
- On payment complete: reset table to vacant, log to P&L
- Concurrency guard: lock table during payment to prevent double-billing

### Flow 7: Staff Rostering (Enhanced `Rostering.tsx`)
- Add Clock-In/Clock-Out simulation panel
- Late detection: if clock-in is >15min after shift start, flag as late
- Mock geo-fence check (always passes, but shows UI for it)
- Shift-end hours calculation
- OT computation: hours > 44/week = 1.5x rate
- Updated payroll table reflects clock records
- Add "Attendance" tab alongside Roster and Payroll

### Flow 8: Customer Feedback (Enhanced post-order flow)
- Rating prompt appears after payment (already exists, enhance it)
- Threshold logic: rating < 3 triggers manager SMS alert notification
- Rating >= 4: show "Share on social media" mock prompt
- Award loyalty points based on order total (1 point per $1 spent)
- Update loyalty progress bar after points awarded

---

## New Mock Data (`src/mockData.ts` additions)

- `getRecipeMap()`: Maps menu item IDs to ingredient lists with quantities
- `getMockPayments()`: Sample payment records
- `getMockPurchaseOrders()`: Sample POs in various states
- `getMockClockRecords()`: Sample attendance data for the current week

---

## UI Changes Summary

| File | Changes |
|------|---------|
| `src/types.ts` | Add Payment, PurchaseOrder, ClockRecord, Feedback, AuditEntry, ItemModifier types |
| `src/mockData.ts` | Add recipe map, mock payments, POs, clock records |
| `src/lib/eventBus.ts` | New -- typed pub/sub event system |
| `src/lib/flowStateMachine.ts` | New -- generic state machine utility |
| `src/lib/recipeEngine.ts` | New -- async recipe-based inventory deduction |
| `src/lib/auditLog.ts` | New -- in-memory audit trail |
| `src/store/useAppStore.ts` | Add payment, PO, clock, feedback, audit slices + concurrency guards |
| `src/pages/POS.tsx` | New -- waiter POS workflow page |
| `src/pages/KDS.tsx` | Add chef state transitions, dessert station, event bus subscription |
| `src/pages/Operations.tsx` | Add bill request, split bill, payment flow, table locking |
| `src/pages/Inventory.tsx` | Add approval gate, GRN step, PO history table |
| `src/pages/Rostering.tsx` | Add Attendance tab with clock-in/out, late detection |
| `src/pages/Customer.tsx` | Add modifiers, login check, payment method selection, enhanced feedback |
| `src/pages/Dashboard.tsx` | Add audit log panel (collapsible) |
| `src/components/layout/RoleBasedLayout.tsx` | Add POS route to MANAGER/ADMIN menus |
| `src/App.tsx` | Add `/pos` route |

---

## Technical Decisions

- **No XState dependency**: A lightweight custom state machine keeps the bundle small and avoids learning curve. The pattern is the same (states, transitions, guards, actions).
- **Event bus over direct coupling**: Flows communicate via events so Flow 4 (Recipe Engine) runs asynchronously without blocking Flow 2/3.
- **Optimistic locking for inventory**: Each item has a `version` field. Concurrent deductions check version before applying, preventing race conditions in the mock layer.
- **Table locking during payment**: A `lockedTables` Set in the store prevents simultaneous bill-close attempts on the same table.
- **All async operations use `setTimeout`** to simulate network latency and demonstrate non-blocking patterns.

