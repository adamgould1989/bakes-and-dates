import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/supabase/db'
import { InvoiceClient } from './InvoiceClient'
import type { OrderWithItems } from '@/types/app'

export const metadata = {
  title: 'Invoice — LaLa\'s Bakes & Cakes',
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = db()

  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*, menu_items(*))')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const typedOrder = order as OrderWithItems

  // Derive a short invoice number from the order's creation timestamp
  const invoiceNumber = parseInt(
    new Date(typedOrder.created_at).getTime().toString().slice(-4)
  )

  return (
    <>
      {/* Google Fonts for invoice styling */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Baloo+2:wght@700;800&display=swap" />

      {/* Back link — hidden on print */}
      <div className="no-print px-4 pt-4">
        <Link
          href={`/orders/${params.id}`}
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to order
        </Link>
      </div>

      <InvoiceClient order={typedOrder} invoiceNumber={invoiceNumber} />
    </>
  )
}
