'use server'

import { db } from '@/lib/supabase/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResult } from '@/types/app'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export async function createCustomer(formData: unknown): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { data, error } = await db()
    .from('customers')
    .insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/customers')
  redirect(`/customers/${data.id}`)
}

export async function updateCustomer(id: string, formData: unknown): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { error } = await db()
    .from('customers')
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/customers/${id}`)
  revalidatePath('/customers')
  return { success: true }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const { error } = await db().from('customers').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/customers')
  return { success: true }
}
