# LaLa's Bakes & Cakes — Order Management App

A calendar-based order management app for LaLa's Bakes & Cakes. Manage customers, menu items, orders, prep schedules, and generate branded invoices.

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Postgres + Auth + RLS)
- **Tailwind CSS** + Radix UI primitives
- **FullCalendar** for the calendar view
- **Vercel** (frontend deployment)

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database setup

Run all migrations in order via the Supabase SQL editor or `supabase db push`:

```
supabase/migrations/
  0001_schema.sql
  0002_rls.sql
  0003_functions.sql
  0004_prep_label.sql
  0005_remove_delivery_date.sql
  0006_add_price_to_menu_items.sql
```

### 4. Create a user

Go to **Supabase Dashboard → Authentication → Users → Invite user** and add the business owner's email.

### 5. Run locally

```bash
npm run dev
```

## Features

| Area | What it does |
|------|-------------|
| **Calendar** | Month/week view of all order deadlines, prep blocks, and unavailable dates |
| **Orders** | Create, edit, and track orders with status, items, prep schedule, and notes |
| **Customers** | Customer profiles with order history |
| **Menu** | Menu items with name, category, prep time, and price |
| **Invoices** | Generate printable/PDF invoices per order with custom add-ons, fixed discounts, and percentage discounts |

## Invoice Generation

Navigate to any order and tap **Invoice**. From there you can:

- Set the price per item (pre-filled from the menu item price if set)
- Add extra line items (add-ons)
- Apply a fixed £ discount or a percentage discount (applied after all other adjustments)
- Print or save as PDF via the browser — the green-branded invoice with payment details is print-ready

### Header photos

The invoice header shows three circular food photos matching the brand template. Place your images at:

```
public/invoice-images/photo-1.jpg
public/invoice-images/photo-2.jpg
public/invoice-images/photo-3.jpg
```

Until images are added, placeholder circles are shown automatically.

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint
npm run test          # Run tests (Vitest)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Project Structure

```
src/
  actions/          # Server actions (orders, customers, menu, calendar)
  app/
    (auth)/         # Login, auth callback, update-password
    (dashboard)/    # Calendar, orders, customers, menu pages + invoice
  components/
    ui/             # Radix-based primitives (button, dialog, select, date-input…)
    calendar/       # CalendarClient, EventPopover, UnavailabilityModal
    orders/         # OrderForm, OrderCard, PrepTimePlanner, OrderItemRow
    customers/      # CustomerForm, CustomerOrderHistory
    menu/           # MenuItemCard, MenuItemForm, MenuItemModal
    layout/         # Header, Sidebar, BottomNav
  lib/
    supabase/       # db.ts (server), browser-db.ts (client)
    utils/          # calendar, prep-time, dates, cn helpers
  types/
    app.ts          # App-level types
    database.ts     # Raw DB row types (manually maintained)
public/
  invoice-images/   # photo-1.jpg, photo-2.jpg, photo-3.jpg (add your own)
```

## Known Limitations

- `database.ts` types are manually maintained — run `supabase gen types typescript --project-id <id>` to regenerate
- Edit order page updates basic fields only; items and prep blocks require re-running the RPC or editing separately
- PrepTimePlanner warns but does not block submit if total prep time doesn't match
