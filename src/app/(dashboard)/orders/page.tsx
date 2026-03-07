import Link from 'next/link'
import { Plus, ShoppingBag } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { OrderCard } from '@/components/orders/OrderCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { OrderWithCustomer } from '@/types/app'

export default async function OrdersPage() {
  const { data } = await db()
    .from('orders')
    .select('*, customers(*)')
    .order('deadline', { ascending: true })

  const allOrders = (data ?? []) as OrderWithCustomer[]

  const groups = {
    active: allOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed'),
    all: allOrders,
    completed: allOrders.filter((o) => o.status === 'completed'),
    cancelled: allOrders.filter((o) => o.status === 'cancelled'),
  }

  return (
    <>
      <Header
        title="Orders"
        action={
          <Link href="/orders/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-6">
        <Tabs defaultValue="active">
          <TabsList className="mb-4 w-full overflow-x-auto justify-start">
            <TabsTrigger value="active">Active ({groups.active.length})</TabsTrigger>
            <TabsTrigger value="all">All ({groups.all.length})</TabsTrigger>
            <TabsTrigger value="completed">Done ({groups.completed.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({groups.cancelled.length})</TabsTrigger>
          </TabsList>

          {(Object.entries(groups) as [keyof typeof groups, OrderWithCustomer[]][]).map(
            ([tab, tabOrders]) => (
              <TabsContent key={tab} value={tab}>
                {tabOrders.length === 0 ? (
                  <div className="text-center py-16 text-white/40">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No orders here</p>
                    {tab === 'active' && (
                      <Link href="/orders/new">
                        <Button className="mt-4" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Create First Order
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tabOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      </div>
    </>
  )
}
