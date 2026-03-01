import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { EditPrepForm } from './EditPrepForm'

export default async function AmendPrepSchedulePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = db()

  const [{ data: order }, { data: prepEvents }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_prep_minutes, customers(name)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('calendar_events')
      .select('start_time, end_time, notes')
      .eq('order_id', params.id)
      .eq('event_type', 'prep')
      .order('start_time'),
  ])

  if (!order) notFound()

  return (
    <>
      <Header title="Amend Prep Schedule" />
      <div className="p-4 md:p-6 max-w-2xl">
        <Link
          href={`/orders/${params.id}`}
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Order
        </Link>

        <p className="text-white/50 text-sm mb-6">
          Edit or replace the existing prep blocks for this order. All current prep calendar
          events will be replaced when you save.
        </p>

        <EditPrepForm
          orderId={params.id}
          totalPrepMinutes={order.total_prep_minutes}
          prepEvents={prepEvents ?? []}
        />
      </div>
    </>
  )
}
