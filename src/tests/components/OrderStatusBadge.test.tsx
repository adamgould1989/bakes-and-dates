import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import type { OrderStatus } from '@/types/app'

describe('OrderStatusBadge', () => {
  it('renders "Pending" for pending status', () => {
    render(<OrderStatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders "Confirmed" for confirmed status', () => {
    render(<OrderStatusBadge status="confirmed" />)
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
  })

  it('renders "Completed" for completed status', () => {
    render(<OrderStatusBadge status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders "Cancelled" for cancelled status', () => {
    render(<OrderStatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('renders a single element', () => {
    const { container } = render(<OrderStatusBadge status="pending" />)
    expect(container.firstChild).not.toBeNull()
  })

  const statuses: OrderStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']
  statuses.forEach((status) => {
    it(`renders without crashing for status: ${status}`, () => {
      expect(() => render(<OrderStatusBadge status={status} />)).not.toThrow()
    })
  })
})
