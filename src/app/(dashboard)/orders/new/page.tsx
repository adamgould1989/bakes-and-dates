import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { OrderForm } from '@/components/orders/OrderForm'
import type { Customer, MenuItem } from '@/types/app'

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: { customerId?: string }
}) {
  const supabase = db()

  const [{ data: customers }, { data: menuItems }] = await Promise.all([
    supabase.from('customers').select('*').order('name'),
    supabase.from('menu_items').select('*').eq('is_active', true).order('name'),
  ])

  return (
    <>
      <Header title="New Order" />
      <div className="p-4 md:p-6 max-w-2xl">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Orders
        </Link>

        <OrderForm
          customers={(customers ?? []) as Customer[]}
          menuItems={(menuItems ?? []) as MenuItem[]}
          defaultCustomerId={searchParams.customerId}
        />
      </div>
    </>
  )
}
