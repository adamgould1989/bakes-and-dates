'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createMenuItem, updateMenuItem } from '@/actions/menu'
import type { MenuItem } from '@/types/app'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  base_prep_time_minutes: z.coerce.number().min(0).default(0),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

interface MenuItemFormProps {
  item?: MenuItem
  onSuccess?: () => void
}

export function MenuItemForm({ item, onSuccess }: MenuItemFormProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description ?? '',
          base_prep_time_minutes: item.base_prep_time_minutes,
          category: item.category ?? '',
          is_active: item.is_active,
        }
      : { is_active: true, base_prep_time_minutes: 0 },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    if (item) {
      const result = await updateMenuItem(item.id, values)
      if (result.success) {
        toast.success('Menu item updated')
        onSuccess?.()
      } else {
        toast.error(result.error ?? 'Error updating menu item')
        setSaving(false)
      }
    } else {
      // createMenuItem redirects on success
      await createMenuItem(values)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Name *</Label>
        <Input {...register('name')} placeholder="e.g. Victoria Sponge" />
        {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Input {...register('category')} placeholder="e.g. Cakes, Biscuits" />
      </div>

      <div className="space-y-1.5">
        <Label>Base Prep Time (minutes per batch)</Label>
        <Input
          type="number"
          min="0"
          step="5"
          {...register('base_prep_time_minutes')}
          placeholder="60"
        />
        {errors.base_prep_time_minutes && (
          <p className="text-red-400 text-xs">{errors.base_prep_time_minutes.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          {...register('description')}
          placeholder="Optional description or notes…"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? 'Saving…' : item ? 'Update Menu Item' : 'Create Menu Item'}
      </Button>
    </form>
  )
}
