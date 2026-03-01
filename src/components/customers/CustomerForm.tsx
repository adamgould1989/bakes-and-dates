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
import { createCustomer, updateCustomer } from '@/actions/customers'
import type { Customer } from '@/types/app'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CustomerFormProps {
  customer?: Customer
  onSuccess?: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          notes: customer.notes ?? '',
        }
      : {},
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    if (customer) {
      const result = await updateCustomer(customer.id, values)
      if (result.success) {
        toast.success('Customer updated')
        onSuccess?.()
      } else {
        toast.error(result.error ?? 'Error updating customer')
      }
    } else {
      // createCustomer redirects on success
      await createCustomer(values)
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Name *</Label>
        <Input {...register('name')} placeholder="Full name" />
        {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input {...register('email')} type="email" placeholder="customer@example.com" />
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input {...register('phone')} type="tel" placeholder="+44 7700 900000" />
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea {...register('notes')} placeholder="Allergies, preferences, etc." rows={3} />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? 'Saving…' : customer ? 'Update Customer' : 'Create Customer'}
      </Button>
    </form>
  )
}
