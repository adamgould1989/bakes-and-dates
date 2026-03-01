import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail, Phone, FileText, Pencil, Plus } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerOrderHistory } from '@/components/customers/CustomerOrderHistory'
import type { Customer, OrderWithCustomer } from '@/types/app'

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = db()

  const [{ data: customer }, { data: orders }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', params.id).single(),
    supabase
      .from('orders')
      .select('*, customers(*)')
      .eq('customer_id', params.id)
      .order('deadline', { ascending: false }),
  ])

  if (!customer) notFound()

  const typedCustomer = customer as Customer

  return (
    <>
      <Header
        title={typedCustomer.name}
        action={
          <Link href={`/orders/new?customerId=${typedCustomer.id}`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Order
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-6 space-y-5 max-w-2xl">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Customers
        </Link>

        {/* Profile card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <span className="text-brand-gold font-bold text-lg">
                    {typedCustomer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle>{typedCustomer.name}</CardTitle>
              </div>
              <Link href={`/customers/${typedCustomer.id}/edit`}>
                <Button variant="outline" size="icon">
                  <Pencil className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {typedCustomer.email && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-white/40" />
                <a href={`mailto:${typedCustomer.email}`} className="hover:text-white">
                  {typedCustomer.email}
                </a>
              </div>
            )}
            {typedCustomer.phone && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-white/40" />
                <a href={`tel:${typedCustomer.phone}`} className="hover:text-white">
                  {typedCustomer.phone}
                </a>
              </div>
            )}
            {typedCustomer.notes && (
              <div className="flex items-start gap-2 text-white/70 text-sm">
                <FileText className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                <p className="whitespace-pre-wrap">{typedCustomer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order history */}
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Order History
          </h2>
          <CustomerOrderHistory orders={(orders as OrderWithCustomer[]) ?? []} />
        </div>
      </div>
    </>
  )
}
