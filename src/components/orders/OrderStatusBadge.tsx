import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/app'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const variantMap: Record<OrderStatus, 'pending' | 'confirmed' | 'completed' | 'cancelled'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
}

const labelMap: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>
}
