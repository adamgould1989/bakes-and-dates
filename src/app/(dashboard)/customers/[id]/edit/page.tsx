'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { browserDb } from '@/lib/supabase/browser-db'
import { Header } from '@/components/layout/Header'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import type { Customer } from '@/types/app'

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = browserDb()
    supabase
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }: { data: import('@/types/app').Customer | null }) => {
        setCustomer(data)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6 text-white/50">Loading…</div>
    )
  }

  if (!customer) return notFound()

  return (
    <>
      <Header title="Edit Customer" />
      <div className="p-4 md:p-6 max-w-lg">
        <Link
          href={`/customers/${params.id}`}
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Customer
        </Link>
        <Card>
          <CardContent className="p-6">
            <CustomerForm
              customer={customer}
              onSuccess={() => router.push(`/customers/${params.id}`)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
