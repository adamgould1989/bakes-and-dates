'use client'

import { useCallback, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UnavailabilityModal } from './UnavailabilityModal'
import { EventPopover } from './EventPopover'
import type { CalendarEventView } from '@/types/app'

// FullCalendar v6 bundles its CSS automatically — no import needed

interface CalendarClientProps {
  events: CalendarEventView[]
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

function EventPill({ info }: { info: EventContentArg }) {
  const type = info.event.extendedProps.eventType as string
  const icons: Record<string, string> = {
    deadline: '⚑',
    prep: '🧁',
    delivery: '🚚',
    unavailable: '✕',
  }
  const isTimeGrid = info.view.type.startsWith('timeGrid')

  if (isTimeGrid) {
    return (
      <div className="px-1.5 py-0.5 w-full overflow-hidden">
        {info.timeText && (
          <p className="text-[10px] leading-tight font-semibold opacity-90 truncate">
            {info.timeText}
          </p>
        )}
        <div className="flex items-center gap-1 truncate mt-0.5">
          <span className="text-xs leading-none flex-shrink-0">{icons[type] ?? '•'}</span>
          <span className="text-xs font-medium truncate">{info.event.title}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 px-1 truncate">
      <span className="text-xs leading-none">{icons[type] ?? '•'}</span>
      {info.timeText && !info.event.allDay && (
        <span className="text-[10px] opacity-80 flex-shrink-0">{info.timeText}</span>
      )}
      <span className="text-xs font-medium truncate">{info.event.title}</span>
    </div>
  )
}

export function CalendarClient({ events }: CalendarClientProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [view, setView] = useState<ViewType>('dayGridMonth')
  const [title, setTitle] = useState('')
  const [unavailModal, setUnavailModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventView | null>(null)

  const updateTitle = useCallback(() => {
    const api = calendarRef.current?.getApi()
    if (api) setTitle(api.view.title)
  }, [])

  function navigate(dir: 'prev' | 'next' | 'today') {
    const api = calendarRef.current?.getApi()
    if (!api) return
    if (dir === 'prev') api.prev()
    else if (dir === 'next') api.next()
    else api.today()
    updateTitle()
  }

  function changeView(v: ViewType) {
    const api = calendarRef.current?.getApi()
    if (!api) return
    api.changeView(v)
    setView(v)
    updateTitle()
  }

  function prevDay(dateStr: string): string {
    const d = new Date(dateStr)
    d.setUTCDate(d.getUTCDate() - 1)
    return d.toISOString().slice(0, 10)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleDateSelect(arg: any) {
    const startDate = arg.startStr.slice(0, 10)
    // FullCalendar end is exclusive for all-day events, subtract one day
    const endDate = arg.allDay ? prevDay(arg.endStr) : arg.endStr.slice(0, 10)
    setSelectedDate(startDate)
    setSelectedEndDate(endDate)
    setUnavailModal(true)
  }

  function handleEventClick(arg: EventClickArg) {
    const ev = arg.event
    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      start: ev.startStr,
      end: ev.endStr,
      allDay: ev.allDay,
      backgroundColor: ev.backgroundColor,
      borderColor: ev.borderColor,
      extendedProps: {
        eventType: ev.extendedProps.eventType,
        orderId: ev.extendedProps.orderId,
        notes: ev.extendedProps.notes,
      },
    })
  }

  const viewLabels: Record<ViewType, string> = {
    dayGridMonth: 'Month',
    timeGridWeek: 'Week',
    timeGridDay: 'Day',
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 flex-wrap gap-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('today')}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-white font-semibold text-sm md:text-base ml-1 min-w-[120px]">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-white/20 overflow-hidden">
            {(['dayGridMonth', 'timeGridWeek', 'timeGridDay'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => changeView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-brand-gold text-brand-bg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={() => { setSelectedDate(undefined); setSelectedEndDate(undefined); setUnavailModal(true) }}>
            <Plus className="w-4 h-4 mr-1" />
            Block
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-2 md:p-4 overflow-auto">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={events}
          selectable={true}
          selectMirror={true}
          eventDisplay="block"
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={(info) => <EventPill info={info} />}
          height="auto"
          firstDay={1}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          expandRows={true}
          datesSet={updateTitle}
          nowIndicator={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
        />
      </div>

      {/* Modals */}
      <UnavailabilityModal
        open={unavailModal}
        onClose={() => setUnavailModal(false)}
        defaultDate={selectedDate}
        defaultEndDate={selectedEndDate}
      />
      <EventPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}
