import Link from 'next/link'
import { ChevronRight, Calendar, Truck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatDate } from '@/lib/utils/dates'
import type { OrderWithCustomer } from '@/types/app'

interface OrderCardProps {
  order: OrderWithCustomer
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:bg-white/5 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-white">{order.customers.name}</span>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex items-center gap-3 text-white/50 text-xs flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Deadline: {formatDate(order.deadline)}
                </span>
                {order.delivery_date && (
                  <span className="flex items-center gap-1 capitalize">
                    <Truck className="w-3 h-3" />
                    {order.delivery_type}: {formatDate(order.delivery_date)}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
