import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Card, CardContent } from '@/components/ui/card'

export default function NewCustomerPage() {
  return (
    <>
      <Header title="New Customer" />
      <div className="p-4 md:p-6 max-w-lg">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Customers
        </Link>
        <Card>
          <CardContent className="p-6">
            <CustomerForm />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
