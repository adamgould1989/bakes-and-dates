'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderItemRow } from './OrderItemRow'
import { PrepTimePlanner } from './PrepTimePlanner'
import { createOrder } from '@/actions/orders'
import { calculateTotalPrepMinutes } from '@/lib/utils/prep-time'
import { todayISO } from '@/lib/utils/dates'
import type { Customer, MenuItem, OrderFormValues } from '@/types/app'

const prepBlockSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  durationHours: z.coerce.number().min(0),
  durationMinutes: z.coerce.number().min(0).max(59),
})

const orderItemSchema = z.object({
  menuItemId: z.string().uuid('Select a menu item'),
  quantity: z.coerce.number().min(1),
  batches: z.coerce.number().min(1),
  notes: z.string().optional(),
})

const schema = z.object({
  customerId: z.string().uuid('Please select a customer'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).default('pending'),
  deadline: z.string().min(1, 'Deadline is required'),
  deliveryType: z.enum(['delivery', 'collection']),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  orderItems: z.array(orderItemSchema).min(1, 'Add at least one item'),
  prepBlocks: z.array(prepBlockSchema),
})

type FormValues = z.infer<typeof schema>

interface OrderFormProps {
  customers: Customer[]
  menuItems: MenuItem[]
  defaultCustomerId?: string
}

export function OrderForm({ customers, menuItems, defaultCustomerId }: OrderFormProps) {
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm<OrderFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      customerId: defaultCustomerId ?? '',
      status: 'pending',
      deadline: '',
      deliveryType: 'collection',
      deliveryDate: '',
      deliveryAddress: '',
      notes: '',
      orderItems: [],
      prepBlocks: [],
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = methods

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'orderItems',
  })

  const orderItems = watch('orderItems') || []
  const deliveryType = watch('deliveryType')

  // Compute total prep minutes live
  const totalPrepMinutes = calculateTotalPrepMinutes(
    orderItems.map((i) => ({ menuItemId: i.menuItemId, batches: i.batches || 1 })),
    menuItems
  )

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      await createOrder({ ...values, totalPrepMinutes })
    } catch (e) {
      // redirect throws an error, which is normal
      const err = e as Error
      if (!err.message?.includes('NEXT_REDIRECT')) {
        toast.error('Failed to create order')
        setSubmitting(false)
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Section: Customer & Status */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Customer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select
                value={watch('customerId')}
                onValueChange={(val) => setValue('customerId', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer…" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-red-400 text-xs">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(val) => setValue('status', val as OrderFormValues['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Section: Dates */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Dates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Deadline *</Label>
              <Input type="date" {...register('deadline')} />
              {errors.deadline && <p className="text-red-400 text-xs">{errors.deadline.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Delivery Type *</Label>
              <Select
                value={deliveryType}
                onValueChange={(val) => setValue('deliveryType', val as 'delivery' | 'collection')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{deliveryType === 'delivery' ? 'Delivery Date' : 'Collection Date'}</Label>
              <Input type="date" {...register('deliveryDate')} />
            </div>

            {deliveryType === 'delivery' && (
              <div className="space-y-1.5">
                <Label>Delivery Address</Label>
                <Input {...register('deliveryAddress')} placeholder="Full delivery address" />
              </div>
            )}
          </div>
        </section>

        {/* Section: Items */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Items</h2>

          {itemFields.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/20 rounded-lg text-white/40 text-sm">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No items added yet
            </div>
          ) : (
            <div className="space-y-3">
              {itemFields.map((field, index) => (
                <OrderItemRow
                  key={field.id}
                  index={index}
                  menuItems={menuItems}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </div>
          )}

          {errors.orderItems && (
            <p className="text-red-400 text-xs">{errors.orderItems.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendItem({ menuItemId: '', quantity: 1, batches: 1, notes: '' })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </section>

        {/* Section: Prep Planning */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Prep Schedule</h2>
          <PrepTimePlanner totalPrepMinutes={totalPrepMinutes} />
        </section>

        {/* Section: Notes */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Notes</h2>
          <Textarea {...register('notes')} placeholder="Order notes, special requests…" rows={3} />
        </section>

        <Button type="submit" disabled={submitting} className="w-full" size="lg">
          {submitting ? 'Creating order…' : 'Create Order'}
        </Button>
      </form>
    </FormProvider>
  )
}
