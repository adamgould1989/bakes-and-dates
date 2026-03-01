'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateOrderStatus } from '@/actions/orders'
import type { OrderStatus } from '@/types/app'

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)

  async function handleChange(val: string) {
    const newStatus = val as OrderStatus
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      setStatus(newStatus)
      toast.success('Status updated')
    } else {
      toast.error(result.error ?? 'Failed to update status')
    }
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-36 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="confirmed">Confirmed</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  )
}
