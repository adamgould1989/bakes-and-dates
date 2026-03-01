'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { PrepTimePlanner } from '@/components/orders/PrepTimePlanner'
import { Button } from '@/components/ui/button'
import { updatePrepSchedule } from '@/actions/orders'
import type { OrderFormValues, PrepBlock } from '@/types/app'

interface RawPrepEvent {
  start_time: string
  end_time: string
  notes: string | null
}

function eventToPrepBlock(e: RawPrepEvent): PrepBlock {
  const start = new Date(e.start_time)
  const end = new Date(e.end_time)
  const durationMins = Math.round((end.getTime() - start.getTime()) / 60000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    durationHours: Math.floor(durationMins / 60),
    durationMinutes: durationMins % 60,
    label: e.notes ?? '',
  }
}

interface EditPrepFormProps {
  orderId: string
  totalPrepMinutes: number
  prepEvents: RawPrepEvent[]
}

export function EditPrepForm({ orderId, totalPrepMinutes, prepEvents }: EditPrepFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const methods = useForm<OrderFormValues>({
    defaultValues: {
      prepBlocks: prepEvents.map(eventToPrepBlock),
      customerId: '',
      status: 'pending',
      deadline: '',
      deliveryType: 'collection',
      deliveryDate: '',
      deliveryAddress: '',
      notes: '',
      orderItems: [],
    },
  })

  async function handleSubmit(values: OrderFormValues) {
    setSaving(true)
    const result = await updatePrepSchedule(orderId, values.prepBlocks)
    if (!result.success) {
      toast.error(result.error ?? 'Failed to update prep schedule')
      setSaving(false)
      return
    }
    toast.success('Prep schedule updated')
    router.push(`/orders/${orderId}`)
    router.refresh()
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <PrepTimePlanner totalPrepMinutes={totalPrepMinutes} />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Saving…' : 'Save Prep Schedule'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
