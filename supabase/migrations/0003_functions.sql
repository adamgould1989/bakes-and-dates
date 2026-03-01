create or replace function create_order_with_events(
  p_customer_id uuid,
  p_status text,
  p_deadline date,
  p_delivery_type text,
  p_delivery_date date,
  p_delivery_address text,
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
  v_delivery_start timestamptz;
begin
  -- Insert the order
  insert into orders (
    customer_id, status, deadline, delivery_type,
    delivery_date, delivery_address, notes, total_prep_minutes
  ) values (
    p_customer_id, p_status, p_deadline, p_delivery_type,
    p_delivery_date, p_delivery_address, p_notes, p_total_prep_minutes
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

  -- Create delivery/collection calendar event if date provided
  if p_delivery_date is not null then
    v_delivery_start := p_delivery_date::timestamptz;
    insert into calendar_events (title, event_type, start_time, end_time, order_id, is_all_day)
    values (
      p_delivery_type || ': ' || p_customer_name,
      'delivery',
      v_delivery_start,
      v_delivery_start + interval '1 day',
      v_order_id,
      true
    );
  end if;

  -- Create prep block calendar events
  for v_block in select * from jsonb_array_elements(p_prep_blocks)
  loop
    insert into calendar_events (title, event_type, start_time, end_time, order_id, notes)
    values (
      'Prep: ' || p_customer_name,
      'prep',
      (v_block->>'start_time')::timestamptz,
      (v_block->>'end_time')::timestamptz,
      v_order_id,
      v_block->>'notes'
    );
  end loop;

  return v_order_id;
end;
$$;
