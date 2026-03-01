'use server'

import { db } from '@/lib/supabase/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types/app'

const unavailabilitySchema = z.object({
  title: z.string().min(1, 'Title is required').default('Unavailable'),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  is_all_day: z.boolean().default(false),
  notes: z.string().optional(),
})

export async function createUnavailabilityBlock(formData: unknown): Promise<ActionResult> {
  const parsed = unavailabilitySchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { data, error } = await db()
    .from('calendar_events')
    .insert({
      title: parsed.data.title,
      event_type: 'unavailable',
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      is_all_day: parsed.data.is_all_day,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/calendar')
  return { success: true, id: data.id }
}

export async function deleteCalendarEvent(id: string): Promise<ActionResult> {
  const { error } = await db().from('calendar_events').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/calendar')
  return { success: true }
}
