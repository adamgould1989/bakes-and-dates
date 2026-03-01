create extension if not exists "uuid-ossp";

create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  base_prep_time_minutes integer not null default 0,
  category text,
  is_active boolean not null default true
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  notes text
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  customer_id uuid not null references customers(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled')),
  deadline date not null,
  delivery_type text not null check (delivery_type in ('delivery','collection')),
  delivery_date date,
  delivery_address text,
  notes text,
  total_prep_minutes integer not null default 0
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id) on delete restrict,
  quantity integer not null default 1,
  batches integer not null default 1,
  prep_minutes integer not null default 0,
  notes text
);

create table calendar_events (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  title text not null,
  event_type text not null
    check (event_type in ('deadline','prep','delivery','unavailable')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  order_id uuid references orders(id) on delete cascade,
  notes text,
  is_all_day boolean not null default false
);

-- Performance indexes
create index idx_calendar_events_start_time on calendar_events(start_time);
create index idx_calendar_events_order_id on calendar_events(order_id);
create index idx_orders_deadline on orders(deadline);
create index idx_orders_customer_id on orders(customer_id);
