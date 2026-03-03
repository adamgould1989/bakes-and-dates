'use server'

import { db } from '@/lib/supabase/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResult, OrderStatus } from '@/types/app'
import { prepBlockToCalendarTimes } from '@/lib/utils/prep-time'

const prepBlockSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  durationHours: z.coerce.number().min(0),
  durationMinutes: z.coerce.number().min(0).max(59),
  label: z.string().optional(),
})

const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.coerce.number().min(1),
  batches: z.coerce.number().min(1),
  notes: z.string().optional(),
})

const orderSchema = z.object({
  customerId: z.string().uuid('Customer is required'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).default('pending'),
  deadline: z.string().min(1, 'Deadline is required'),
  deliveryType: z.enum(['delivery', 'collection']),
  notes: z.string().optional(),
  orderItems: z.array(orderItemSchema).min(1, 'At least one item is required'),
  prepBlocks: z.array(prepBlockSchema),
  totalPrepMinutes: z.coerce.number().min(0),
})

export async function createOrder(formData: unknown): Promise<ActionResult> {
  const parsed = orderSchema.safeParse(formData)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { success: false, error: `${firstError.path.join('.')}: ${firstError.message}` }
  }

  const d = parsed.data
  const supabase = db()

  // Get customer name for event titles
  const { data: customer } = await supabase
    .from('customers')
    .select('name')
    .eq('id', d.customerId)
    .single()

  if (!customer) return { success: false, error: 'Customer not found' }

  // Build prep blocks with ISO timestamps
  const prepBlocksForRpc = d.prepBlocks.map((block) => {
    const { start, end } = prepBlockToCalendarTimes(block)
    const label = block.label?.trim() || null
    return { start_time: start, end_time: end, label, notes: label }
  })

  // Build order items for RPC
  const orderItemsForRpc = d.orderItems.map((item) => ({
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    batches: item.batches,
    prep_minutes: 0,
    notes: item.notes || null,
  }))

  const { data: orderId, error } = await supabase.rpc('create_order_with_events', {
    p_customer_id: d.customerId,
    p_status: d.status,
    p_deadline: d.deadline,
    p_delivery_type: d.deliveryType,
    p_notes: d.notes || null,
    p_total_prep_minutes: d.totalPrepMinutes,
    p_order_items: orderItemsForRpc,
    p_prep_blocks: prepBlocksForRpc,
    p_customer_name: customer.name,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/calendar')
  revalidatePath('/orders')
  redirect(`/orders/${orderId}`)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  const { error } = await db()
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/orders/${id}`)
  revalidatePath('/orders')
  return { success: true }
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  const { error } = await db().from('orders').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/orders')
  revalidatePath('/calendar')
  return { success: true }
}

export async function updatePrepSchedule(
  orderId: string,
  prepBlocks: unknown[],
): Promise<ActionResult> {
  const parsed = z.array(prepBlockSchema).safeParse(prepBlocks)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { success: false, error: firstError.message }
  }

  const supabase = db()

  // Get customer name for event titles
  const { data: order } = await supabase
    .from('orders')
    .select('customers(name)')
    .eq('id', orderId)
    .single()

  if (!order) return { success: false, error: 'Order not found' }
  const customerName = (order as { customers: { name: string } }).customers.name

  // Replace prep events atomically: delete then insert
  const { error: deleteError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('order_id', orderId)
    .eq('event_type', 'prep')

  if (deleteError) return { success: false, error: deleteError.message }

  if (parsed.data.length > 0) {
    const newEvents = parsed.data.map((block) => {
      const { start, end } = prepBlockToCalendarTimes(block)
      const label = block.label?.trim() || null
      return {
        title: label ?? `Prep: ${customerName}`,
        event_type: 'prep' as const,
        start_time: start,
        end_time: end,
        order_id: orderId,
        notes: label,
      }
    })

    const { error: insertError } = await supabase.from('calendar_events').insert(newEvents)
    if (insertError) return { success: false, error: insertError.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/calendar')
  return { success: true }
}
