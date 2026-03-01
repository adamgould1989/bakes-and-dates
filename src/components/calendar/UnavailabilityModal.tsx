'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUnavailabilityBlock } from '@/actions/calendar'

const schema = z.object({
  title: z.string().min(1).default('Unavailable'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface UnavailabilityModalProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
}

export function UnavailabilityModal({ open, onClose, defaultDate }: UnavailabilityModalProps) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'Unavailable',
      date: defaultDate ?? '',
      isAllDay: true,
    },
  })

  const isAllDay = watch('isAllDay')

  async function onSubmit(values: FormValues) {
    setSaving(true)

    let startTime: string
    let endTime: string

    if (values.isAllDay) {
      startTime = new Date(values.date + 'T00:00:00').toISOString()
      endTime = new Date(values.date + 'T23:59:59').toISOString()
    } else {
      startTime = new Date(values.date + 'T' + (values.startTime || '09:00') + ':00').toISOString()
      endTime = new Date(values.date + 'T' + (values.endTime || '17:00') + ':00').toISOString()
    }

    const result = await createUnavailabilityBlock({
      title: values.title,
      start_time: startTime,
      end_time: endTime,
      is_all_day: values.isAllDay,
      notes: values.notes,
    })

    if (result.success) {
      toast.success('Unavailability block added')
      onClose()
    } else {
      toast.error(result.error ?? 'Something went wrong')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Block Unavailability</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input {...register('title')} placeholder="Unavailable" />
          </div>

          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              {...register('isAllDay')}
              className="w-4 h-4 accent-brand-pink"
            />
            <Label htmlFor="allDay">All day</Label>
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start time</Label>
                <Input type="time" {...register('startTime')} defaultValue="09:00" />
              </div>
              <div className="space-y-1.5">
                <Label>End time</Label>
                <Input type="time" {...register('endTime')} defaultValue="17:00" />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Block Day'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
