import type { CalendarEvent, CalendarEventView, EventType } from '@/types/app'

export const EVENT_COLORS: Record<EventType, { bg: string; border: string }> = {
  deadline: { bg: '#DC2626', border: '#B91C1C' },
  prep: { bg: '#9333EA', border: '#7C3AED' },
  delivery: { bg: '#2563EB', border: '#1D4ED8' },
  unavailable: { bg: '#4B5563', border: '#374151' },
}

export function toFullCalendarEvent(event: CalendarEvent): CalendarEventView {
  const colors = EVENT_COLORS[event.event_type]
  return {
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    allDay: event.is_all_day,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    extendedProps: {
      eventType: event.event_type,
      orderId: event.order_id,
      notes: event.notes,
    },
  }
}
