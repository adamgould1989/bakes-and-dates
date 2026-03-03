import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderCard } from '@/components/orders/OrderCard'
import type { OrderWithCustomer } from '@/types/app'

// Mock Next.js Link to avoid router context requirements
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

function makeOrder(overrides: Partial<OrderWithCustomer> = {}): OrderWithCustomer {
  return {
    id: 'order-1',
    created_at: '2024-01-01T00:00:00Z',
    customer_id: 'cust-1',
    status: 'pending',
    deadline: '2024-06-20',
    delivery_type: 'collection',
    delivery_date: null,
    delivery_address: null,
    notes: null,
    total_prep_minutes: 60,
    customers: {
      id: 'cust-1',
      created_at: '2024-01-01T00:00:00Z',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: null,
      notes: null,
    },
    ...overrides,
  }
}

describe('OrderCard', () => {
  it('renders the customer name', () => {
    render(<OrderCard order={makeOrder()} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders the order status badge', () => {
    render(<OrderCard order={makeOrder({ status: 'confirmed' })} />)
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
  })

  it('renders the deadline date', () => {
    render(<OrderCard order={makeOrder({ deadline: '2024-06-20' })} />)
    expect(screen.getByText(/20 Jun 2024/)).toBeInTheDocument()
  })

  it('renders a link to the order detail page', () => {
    render(<OrderCard order={makeOrder({ id: 'order-42' })} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/orders/order-42')
  })

  it('shows delivery date when delivery_date is set', () => {
    render(
      <OrderCard
        order={makeOrder({
          delivery_type: 'delivery',
          delivery_date: '2024-06-22',
        })}
      />
    )
    expect(screen.getByText(/22 Jun 2024/)).toBeInTheDocument()
  })

  it('does not show delivery date when delivery_date is null', () => {
    const { queryByText } = render(
      <OrderCard order={makeOrder({ delivery_date: null })} />
    )
    // Should not show a second date (only deadline)
    const dateTexts = screen.queryAllByText(/Jun 2024/)
    // Only the deadline should show
    expect(dateTexts.length).toBe(1)
  })

  it('renders pending status badge', () => {
    render(<OrderCard order={makeOrder({ status: 'pending' })} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders completed status badge', () => {
    render(<OrderCard order={makeOrder({ status: 'completed' })} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders cancelled status badge', () => {
    render(<OrderCard order={makeOrder({ status: 'cancelled' })} />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })
})
