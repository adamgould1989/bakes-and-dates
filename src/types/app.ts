import type { Database } from './database'

export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

export type OrderStatus = Order['status']
export type DeliveryType = Order['delivery_type']
export type EventType = CalendarEvent['event_type']

export interface OrderWithItems extends Order {
  customers: Customer
  order_items: (OrderItem & { menu_items: MenuItem })[]
}

export interface OrderWithCustomer extends Order {
  customers: Customer
}

export interface CalendarEventView {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  backgroundColor: string
  borderColor: string
  extendedProps: {
    eventType: EventType
    orderId: string | null
    notes: string | null
  }
}

export interface PrepBlock {
  date: string
  startTime: string
  durationHours: number
  durationMinutes: number
}

export interface OrderFormValues {
  customerId: string
  status: OrderStatus
  deadline: string
  deliveryType: DeliveryType
  deliveryDate: string
  deliveryAddress: string
  notes: string
  orderItems: {
    menuItemId: string
    quantity: number
    batches: number
    notes: string
  }[]
  prepBlocks: PrepBlock[]
}

export interface ActionResult {
  success: boolean
  error?: string
  id?: string
}
