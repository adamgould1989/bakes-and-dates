-- Remove delivery_date and delivery_address from orders table and RPC.
-- delivery_type is retained.

alter table orders drop column if exists delivery_date;
alter table orders drop column if exists delivery_address;

-- Drop old function signature (parameter list changed; can't use create or replace)
drop function if exists create_order_with_events(uuid, text, date, text, date, text, text, integer, jsonb, jsonb, text);

create function create_order_with_events(
  p_customer_id uuid,
  p_status text,
  p_deadline date,
  p_delivery_type text,
  p_notes text,
  p_total_prep_minutes integer,
  p_order_items jsonb,
  p_prep_blocks jsonb,
  p_customer_name text
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_block jsonb;
  v_deadline_start timestamptz;
  v_label text;
begin
  -- Insert the order
  insert into orders (
    customer_id, status, deadline, delivery_type, notes, total_prep_minutes
  ) values (
    p_customer_id, p_status, p_deadline, p_delivery_type, p_notes, p_total_prep_minutes
  ) returning id into v_order_id;

  -- Insert order items
  for v_item in select * from jsonb_array_elements(p_order_items)
  loop
    insert into order_items (order_id, menu_item_id, quantity, batches, prep_minutes, notes)
    values (
      v_order_id,
      (v_item->>'menu_item_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'batches')::integer,
      (v_item->>'prep_minutes')::integer,
      v_item->>'notes'
    );
  end loop;

  -- Create deadline calendar event (all-day on the deadline date)
  v_deadline_start := p_deadline::timestamptz;
  insert into calendar_events (title, event_type, start_time, end_time, order_id, is_all_day)
  values (
    'Deadline: ' || p_customer_name,
    'deadline',
    v_deadline_start,
    v_deadline_start + interval '1 day',
    v_order_id,
    true
  );

  -- Create prep block calendar events
  for v_block in select * from jsonb_array_elements(p_prep_blocks)
  loop
    v_label := nullif(trim(v_block->>'label'), '');
    insert into calendar_events (title, event_type, start_time, end_time, order_id, notes)
    values (
      coalesce(v_label, 'Prep: ' || p_customer_name),
      'prep',
      (v_block->>'start_time')::timestamptz,
      (v_block->>'end_time')::timestamptz,
      v_order_id,
      v_label
    );
  end loop;

  return v_order_id;
end;
$$;
