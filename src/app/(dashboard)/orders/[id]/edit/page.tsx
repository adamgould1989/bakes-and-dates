import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { EditOrderForm } from './EditOrderForm'
import type { Customer, MenuItem, OrderWithItems } from '@/types/app'

export default async function EditOrderPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = db()

  const [{ data: order }, { data: customers }, { data: menuItems }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, customers(*), order_items(*, menu_items(*))')
      .eq('id', params.id)
      .single(),
    supabase.from('customers').select('*').order('name'),
    supabase.from('menu_items').select('*').eq('is_active', true).order('name'),
  ])

  if (!order) notFound()

  return (
    <>
      <Header title="Edit Order" />
      <div className="p-4 md:p-6 max-w-2xl">
        <Link
          href={`/orders/${params.id}`}
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Order
        </Link>

        <EditOrderForm
          order={order as OrderWithItems}
          customers={(customers ?? []) as Customer[]}
          menuItems={(menuItems ?? []) as MenuItem[]}
        />
      </div>
    </>
  )
}
