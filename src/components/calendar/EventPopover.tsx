'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Trash2, ExternalLink, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteCalendarEvent } from '@/actions/calendar'
import { formatDateTime } from '@/lib/utils/dates'
import { EVENT_COLORS } from '@/lib/utils/calendar'
import type { CalendarEventView } from '@/types/app'

interface EventPopoverProps {
  event: CalendarEventView | null
  onClose: () => void
}

const eventTypeLabels: Record<string, string> = {
  deadline: 'Deadline',
  prep: 'Prep Time',
  delivery: 'Delivery / Collection',
  unavailable: 'Unavailable',
}

export function EventPopover({ event, onClose }: EventPopoverProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!event) return null

  const colors = EVENT_COLORS[event.extendedProps.eventType]

  async function executeDelete() {
    setDeleting(true)
    const result = await deleteCalendarEvent(event!.id)
    if (result.success) {
      toast.success('Event deleted')
      onClose()
    } else {
      toast.error(result.error ?? 'Could not delete event')
      setDeleting(false)
    }
  }

  const eventTypeBadgeVariant = event.extendedProps.eventType as 'deadline' | 'prep' | 'delivery' | 'unavailable'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-brand-surface border border-white/10 rounded-xl shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Badge variant={eventTypeBadgeVariant} className="mb-2">
              {eventTypeLabels[event.extendedProps.eventType]}
            </Badge>
            <h3 className="font-semibold text-white text-base leading-tight">{event.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <span>
              {event.allDay ? formatDateTime(event.start).split(',')[0] : formatDateTime(event.start)}
            </span>
          </div>
          {!event.allDay && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <span>Until {formatDateTime(event.end).split(', ')[1]}</span>
            </div>
          )}
          {event.extendedProps.notes && (
            <p className="text-white/60 text-xs mt-1">{event.extendedProps.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {event.extendedProps.orderId && (
            <Link href={`/orders/${event.extendedProps.orderId}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                View Order
              </Button>
            </Link>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className={event.extendedProps.orderId ? '' : 'flex-1'}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {deleting ? '…' : 'Delete'}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete event?"
        description="This will permanently remove this calendar event."
        onConfirm={executeDelete}
      />
    </div>
  )
}
