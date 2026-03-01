import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/dates'
import type { OrderWithCustomer } from '@/types/app'

interface CustomerOrderHistoryProps {
  orders: OrderWithCustomer[]
}

const statusVariants: Record<string, 'pending' | 'confirmed' | 'completed' | 'cancelled'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-white/40">
        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`}>
          <Card className="hover:bg-white/5 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusVariants[order.status]}>{order.status}</Badge>
                  <span className="text-white/50 text-xs capitalize">{order.delivery_type}</span>
                </div>
                <p className="text-white text-sm mt-1">Deadline: {formatDate(order.deadline)}</p>
                {order.delivery_date && (
                  <p className="text-white/60 text-xs">{order.delivery_type}: {formatDate(order.delivery_date)}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
