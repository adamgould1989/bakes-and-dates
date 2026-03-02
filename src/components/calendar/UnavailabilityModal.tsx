'use client'

import { useEffect, useState } from 'react'
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
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

type FormValues = z.infer<typeof schema>

interface UnavailabilityModalProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
  defaultEndDate?: string
}

export function UnavailabilityModal({ open, onClose, defaultDate, defaultEndDate }: UnavailabilityModalProps) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'Unavailable',
      startDate: defaultDate ?? '',
      endDate: defaultEndDate ?? defaultDate ?? '',
      isAllDay: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: 'Unavailable',
        startDate: defaultDate ?? '',
        endDate: defaultEndDate ?? defaultDate ?? '',
        isAllDay: true,
        startTime: undefined,
        endTime: undefined,
        notes: undefined,
      })
    }
  }, [open, defaultDate, defaultEndDate, reset])

  const isAllDay = watch('isAllDay')

  async function onSubmit(values: FormValues) {
    setSaving(true)

    let startTime: string
    let endTime: string

    if (values.isAllDay) {
      startTime = new Date(values.startDate + 'T00:00:00').toISOString()
      endTime = new Date(values.endDate + 'T23:59:59').toISOString()
    } else {
      startTime = new Date(values.startDate + 'T' + (values.startTime || '09:00') + ':00').toISOString()
      endTime = new Date(values.endDate + 'T' + (values.endTime || '17:00') + ':00').toISOString()
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date *</Label>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>End date *</Label>
              <Input type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-red-400 text-xs">{errors.endDate.message}</p>}
            </div>
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
              {saving ? 'Saving…' : 'Block Dates'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
