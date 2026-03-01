import Link from 'next/link'
import { Plus, Users, ChevronRight, Mail, Phone } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Customer } from '@/types/app'

export default async function CustomersPage() {
  const { data } = await db()
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  const customers = (data ?? []) as Customer[]

  return (
    <>
      <Header
        title="Customers"
        action={
          <Link href="/customers/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-6">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No customers yet</p>
            <p className="text-sm mt-1">Add your first customer to get started</p>
            <Link href="/customers/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-1" />
                Add Customer
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/customers/${customer.id}`}>
                <Card className="hover:bg-white/5 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                      <span className="text-brand-gold font-bold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{customer.name}</p>
                      {customer.email && (
                        <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          {customer.email}
                        </p>
                      )}
                      {customer.phone && (
                        <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
