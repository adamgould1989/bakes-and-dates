'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { browserDb } from '@/lib/supabase/browser-db'
import type { Customer, MenuItem, OrderWithItems } from '@/types/app'

interface EditOrderFormProps {
  order: OrderWithItems
  customers: Customer[]
  menuItems: MenuItem[]
}

export function EditOrderForm({ order, customers, menuItems }: EditOrderFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(order.status)
  const [deadline, setDeadline] = useState(order.deadline)
  const [deliveryType, setDeliveryType] = useState(order.delivery_type)
  const [deliveryDate, setDeliveryDate] = useState(order.delivery_date ?? '')
  const [deliveryAddress, setDeliveryAddress] = useState(order.delivery_address ?? '')
  const [notes, setNotes] = useState(order.notes ?? '')
  const [customerId, setCustomerId] = useState(order.customer_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = browserDb()
    const { error } = await supabase
      .from('orders')
      .update({
        customer_id: customerId,
        status,
        deadline,
        delivery_type: deliveryType,
        delivery_date: deliveryDate || null,
        delivery_address: deliveryAddress || null,
        notes: notes || null,
      })
      .eq('id', order.id)

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Order updated')
    router.push(`/orders/${order.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
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

        <div className="space-y-1.5">
          <Label>Deadline *</Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Delivery Type</Label>
          <Select value={deliveryType} onValueChange={(v) => setDeliveryType(v as typeof deliveryType)}>
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
          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        {deliveryType === 'delivery' && (
          <div className="space-y-1.5">
            <Label>Delivery Address</Label>
            <Input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Full address"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Order notes…"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
