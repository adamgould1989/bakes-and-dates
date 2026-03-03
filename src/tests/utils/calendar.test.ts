import { describe, it, expect } from 'vitest'
import { EVENT_COLORS, toFullCalendarEvent } from '@/lib/utils/calendar'
import type { CalendarEvent } from '@/types/app'

function makeCalendarEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt-1',
    created_at: '2024-01-01T00:00:00Z',
    title: 'Test Event',
    event_type: 'deadline',
    start_time: '2024-06-15T09:00:00Z',
    end_time: '2024-06-15T10:00:00Z',
    order_id: null,
    notes: null,
    is_all_day: false,
    ...overrides,
  }
}

describe('EVENT_COLORS', () => {
  it('has colors for all event types', () => {
    const types = ['deadline', 'prep', 'delivery', 'unavailable'] as const
    types.forEach((type) => {
      expect(EVENT_COLORS[type]).toBeDefined()
      expect(EVENT_COLORS[type].bg).toBeTruthy()
      expect(EVENT_COLORS[type].border).toBeTruthy()
    })
  })

  it('uses red for deadline events', () => {
    expect(EVENT_COLORS.deadline.bg).toBe('#DC2626')
    expect(EVENT_COLORS.deadline.border).toBe('#B91C1C')
  })

  it('uses purple for prep events', () => {
    expect(EVENT_COLORS.prep.bg).toBe('#9333EA')
    expect(EVENT_COLORS.prep.border).toBe('#7C3AED')
  })

  it('uses blue for delivery events', () => {
    expect(EVENT_COLORS.delivery.bg).toBe('#2563EB')
    expect(EVENT_COLORS.delivery.border).toBe('#1D4ED8')
  })

  it('uses gray for unavailable events', () => {
    expect(EVENT_COLORS.unavailable.bg).toBe('#4B5563')
    expect(EVENT_COLORS.unavailable.border).toBe('#374151')
  })
})

describe('toFullCalendarEvent', () => {
  it('maps basic fields correctly', () => {
    const event = makeCalendarEvent({ id: 'evt-123', title: 'My Deadline' })
    const result = toFullCalendarEvent(event)
    expect(result.id).toBe('evt-123')
    expect(result.title).toBe('My Deadline')
  })

  it('maps start and end times', () => {
    const event = makeCalendarEvent({
      start_time: '2024-06-15T09:00:00Z',
      end_time: '2024-06-15T11:00:00Z',
    })
    const result = toFullCalendarEvent(event)
    expect(result.start).toBe('2024-06-15T09:00:00Z')
    expect(result.end).toBe('2024-06-15T11:00:00Z')
  })

  it('maps allDay flag', () => {
    const event = makeCalendarEvent({ is_all_day: true })
    expect(toFullCalendarEvent(event).allDay).toBe(true)
  })

  it('applies deadline colors for deadline event', () => {
    const event = makeCalendarEvent({ event_type: 'deadline' })
    const result = toFullCalendarEvent(event)
    expect(result.backgroundColor).toBe(EVENT_COLORS.deadline.bg)
    expect(result.borderColor).toBe(EVENT_COLORS.deadline.border)
  })

  it('applies prep colors for prep event', () => {
    const event = makeCalendarEvent({ event_type: 'prep' })
    const result = toFullCalendarEvent(event)
    expect(result.backgroundColor).toBe(EVENT_COLORS.prep.bg)
    expect(result.borderColor).toBe(EVENT_COLORS.prep.border)
  })

  it('applies delivery colors for delivery event', () => {
    const event = makeCalendarEvent({ event_type: 'delivery' })
    const result = toFullCalendarEvent(event)
    expect(result.backgroundColor).toBe(EVENT_COLORS.delivery.bg)
    expect(result.borderColor).toBe(EVENT_COLORS.delivery.border)
  })

  it('applies unavailable colors for unavailable event', () => {
    const event = makeCalendarEvent({ event_type: 'unavailable' })
    const result = toFullCalendarEvent(event)
    expect(result.backgroundColor).toBe(EVENT_COLORS.unavailable.bg)
    expect(result.borderColor).toBe(EVENT_COLORS.unavailable.border)
  })

  it('populates extendedProps with eventType, orderId and notes', () => {
    const event = makeCalendarEvent({
      event_type: 'prep',
      order_id: 'order-abc',
      notes: 'Bake the croissants',
    })
    const result = toFullCalendarEvent(event)
    expect(result.extendedProps.eventType).toBe('prep')
    expect(result.extendedProps.orderId).toBe('order-abc')
    expect(result.extendedProps.notes).toBe('Bake the croissants')
  })

  it('passes null orderId and notes when not set', () => {
    const event = makeCalendarEvent({ order_id: null, notes: null })
    const result = toFullCalendarEvent(event)
    expect(result.extendedProps.orderId).toBeNull()
    expect(result.extendedProps.notes).toBeNull()
  })
})
