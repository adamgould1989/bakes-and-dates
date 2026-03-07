# Bakes & Dates — CLAUDE.md

## Project Overview
Order management calendar app for LaLa's Bakes & Cakes. Built with Next.js 14 (App Router) + Supabase + Tailwind CSS. Deployed to Vercel (frontend) + Supabase Cloud (DB).

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage
```

## Architecture

### Supabase Client Rules — CRITICAL
- **Server Components / Server Actions**: use `db()` from `src/lib/supabase/db.ts`
- **Client Components (`'use client'`)**: use `browserDb()` from `src/lib/supabase/browser-db.ts`
- Never import `db.ts` (which uses `next/headers`) into client components — it will break.
- No `<Database>` generic on Supabase client — cast results to app types manually.

### Key Patterns
- All server actions live in `src/actions/` and use `db()`
- Order creation is atomic via Postgres RPC `create_order_with_events` (migration 0003)
- FullCalendar is loaded with `dynamic(() => import(...), { ssr: false })` — never SSR it

### File Structure
```
src/
  actions/         # Server actions (calendar, customers, menu, orders)
  app/
    (auth)/        # login, auth callback, update-password
    (dashboard)/   # calendar, orders, customers, menu pages
  components/
    ui/            # Radix-based primitives (button, dialog, select, etc.)
    calendar/      # CalendarClient, EventPopover, UnavailabilityModal
    orders/        # OrderCard, OrderForm, PrepTimePlanner, OrderItemRow
    customers/     # CustomerForm, CustomerOrderHistory
    menu/          # MenuItemCard, MenuItemForm, MenuItemModal
    layout/        # Header, Sidebar, BottomNav
  lib/
    supabase/      # db.ts (server), browser-db.ts (client), server.ts, client.ts
    utils/         # calendar.ts, prep-time.ts, dates.ts, cn.ts
  types/
    app.ts         # App-level types (OrderWithItems, CalendarEventView, PrepBlock, etc.)
    database.ts    # Raw DB row types (manual — not auto-generated)
  tests/           # Vitest tests mirroring src structure
supabase/
  migrations/      # 0001 schema, 0002 RLS, 0003 functions, 0004 prep_label, 0005 remove_delivery_date
```

## Types
Core types in `src/types/app.ts`:
- `MenuItem`, `Customer`, `Order`, `OrderItem`, `CalendarEvent` — raw DB rows
- `OrderWithItems` — order joined with customer + items + menu_items
- `CalendarEventView` — shape expected by FullCalendar
- `PrepBlock` — a prep time block on the calendar
- `ActionResult` — standard `{ success, error?, id? }` return from server actions

## Brand / Styling
- Background: `#2A4A1F` (deep green) | Gold: `#C9A227` | Pink: `#E8426A`
- Surface: `#1E3A16` | Cream: `#FFFBF2`
- Calendar event colors: deadline=`#DC2626`, prep=`#9333EA`, delivery=`#2563EB`, unavailable=`#4B5563`
- UI components use Radix UI primitives + Tailwind + `class-variance-authority`
- `cn()` utility from `src/lib/utils/cn.ts` (clsx + tailwind-merge)

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Known Limitations
- `database.ts` types are manually maintained — ideally replace with `supabase gen types typescript`
- PrepTimePlanner warns but does not block submit when total prep time doesn't match
- Edit order page edits basic fields only; items and prep blocks require re-running the RPC or separate event editing
