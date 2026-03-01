alter table menu_items enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table calendar_events enable row level security;

-- Single user: full access for any authenticated session
create policy "auth full access" on menu_items for all using (auth.role() = 'authenticated');
create policy "auth full access" on customers for all using (auth.role() = 'authenticated');
create policy "auth full access" on orders for all using (auth.role() = 'authenticated');
create policy "auth full access" on order_items for all using (auth.role() = 'authenticated');
create policy "auth full access" on calendar_events for all using (auth.role() = 'authenticated');
