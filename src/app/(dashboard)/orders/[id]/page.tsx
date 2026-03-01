import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Truck, Clock, Pencil, CalendarClock } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusUpdater } from './OrderStatusUpdater'
import { DeleteOrderButton } from './DeleteOrderButton'
import { formatDate } from '@/lib/utils/dates'
import { formatDuration } from '@/lib/utils/prep-time'
import type { OrderWithItems } from '@/types/app'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = db()

  const [{ data: order }, { data: prepEvents }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, customers(*), order_items(*, menu_items(*))')
      .eq('id', params.id)
      .single(),
    supabase
      .from('calendar_events')
      .select('id, start_time, end_time, notes')
      .eq('order_id', params.id)
      .eq('event_type', 'prep')
      .order('start_time'),
  ])

  if (!order) notFound()

  const typedOrder = order as OrderWithItems

  return (
    <>
      <Header
        title="Order Detail"
        action={
          <div className="flex gap-2">
            <Link href={`/orders/${params.id}/prep`}>
              <Button variant="outline" size="sm">
                <CalendarClock className="w-4 h-4 mr-1" />
                Prep
              </Button>
            </Link>
            <Link href={`/orders/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-5 max-w-2xl">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Orders
        </Link>

        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <Link
                  href={`/customers/${typedOrder.customer_id}`}
                  className="text-brand-gold hover:underline font-semibold text-lg"
                >
                  {typedOrder.customers.name}
                </Link>
                <div className="mt-1">
                  <OrderStatusBadge status={typedOrder.status} />
                </div>
              </div>
              <OrderStatusUpdater orderId={params.id} currentStatus={typedOrder.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4 text-red-400" />
              <span>
                Deadline:{' '}
                <strong className="text-white">{formatDate(typedOrder.deadline)}</strong>
              </span>
            </div>
            {typedOrder.delivery_date && (
              <div className="flex items-center gap-2 text-white/70">
                <Truck className="w-4 h-4 text-blue-400" />
                <span className="capitalize">
                  {typedOrder.delivery_type}:{' '}
                  <strong className="text-white">{formatDate(typedOrder.delivery_date)}</strong>
                </span>
              </div>
            )}
            {typedOrder.delivery_address && (
              <p className="text-white/50 text-xs pl-6">{typedOrder.delivery_address}</p>
            )}
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>
                Total prep:{' '}
                <strong className="text-white">
                  {formatDuration(typedOrder.total_prep_minutes)}
                </strong>
              </span>
            </div>
            {typedOrder.notes && (
              <p className="text-white/60 text-sm italic border-t border-white/10 pt-3">
                {typedOrder.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Items
          </h2>
          <div className="space-y-2">
            {typedOrder.order_items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <p className="font-medium text-white text-sm">{item.menu_items.name}</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    Qty: {item.quantity} · Batches: {item.batches}
                    {item.prep_minutes > 0 && ` · ${formatDuration(item.prep_minutes)} prep`}
                  </p>
                  {item.notes && (
                    <p className="text-white/40 text-xs italic mt-1">{item.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prep Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Prep Schedule
            </h2>
            <Link href={`/orders/${params.id}/prep`}>
              <Button variant="outline" size="sm">
                <CalendarClock className="w-3.5 h-3.5 mr-1" />
                Amend
              </Button>
            </Link>
          </div>
          {prepEvents && prepEvents.length > 0 ? (
            <div className="space-y-2">
              {prepEvents.map((event) => {
                const start = new Date(event.start_time)
                const end = new Date(event.end_time)
                const durationMins = Math.round((end.getTime() - start.getTime()) / 60000)
                return (
                  <Card key={event.id}>
                    <CardContent className="p-3">
                      {event.notes && (
                        <p className="font-medium text-white text-sm">{event.notes}</p>
                      )}
                      <p className="text-white/50 text-xs mt-0.5">
                        {formatDate(event.start_time)} &middot;{' '}
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' '}–{' '}
                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' '}·{' '}{formatDuration(durationMins)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-4 border border-dashed border-white/10 rounded-lg">
              No prep blocks scheduled yet
            </p>
          )}
        </div>

        {/* Danger zone */}
        <div className="border border-red-500/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
          <DeleteOrderButton orderId={params.id} />
        </div>
      </div>
    </>
  )
}
