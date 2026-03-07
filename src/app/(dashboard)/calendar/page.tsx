import dynamic from 'next/dynamic'
import { db } from '@/lib/supabase/db'
import { toFullCalendarEvent } from '@/lib/utils/calendar'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { CalendarEvent } from '@/types/app'

const CalendarClient = dynamic(
  () => import('@/components/calendar/CalendarClient').then((m) => m.CalendarClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-white/40">
        Loading calendar…
      </div>
    ),
  }
)

export default async function CalendarPage() {
  const { data } = await db()
    .from('calendar_events')
    .select('*')
    .order('start_time', { ascending: true })

  const calendarEvents = ((data ?? []) as CalendarEvent[]).map(toFullCalendarEvent)

  return (
    <div className="h-screen flex flex-col">
      <Header
        title="Calendar"
        action={
          <Link href="/orders/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Order
            </Button>
          </Link>
        }
      />
      <div className="flex-1 overflow-hidden">
        <CalendarClient events={calendarEvents} />
      </div>
    </div>
  )
}
