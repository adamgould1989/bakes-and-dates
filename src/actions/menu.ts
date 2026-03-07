'use server'

import { db } from '@/lib/supabase/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResult, MenuItem } from '@/types/app'

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  base_prep_time_minutes: z.coerce.number().min(0),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable().optional()
  ),
})

export async function createMenuItem(formData: unknown): Promise<ActionResult> {
  const parsed = menuItemSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { data, error } = await db()
    .from('menu_items')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/menu')
  redirect('/menu')
}

export async function updateMenuItem(id: string, formData: unknown): Promise<ActionResult> {
  const parsed = menuItemSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { error } = await db()
    .from('menu_items')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/menu')
  return { success: true }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const { error } = await db().from('menu_items').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/menu')
  return { success: true }
}

export async function toggleMenuItemActive(id: string, isActive: boolean): Promise<ActionResult> {
  const { error } = await db()
    .from('menu_items')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/menu')
  return { success: true }
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data } = await db()
    .from('menu_items')
    .select('*')
    .order('name')
  return (data ?? []) as MenuItem[]
}
