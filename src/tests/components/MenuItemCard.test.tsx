import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import type { MenuItem } from '@/types/app'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock server actions
vi.mock('@/actions/menu', () => ({
  deleteMenuItem: vi.fn().mockResolvedValue({ success: true }),
  toggleMenuItemActive: vi.fn().mockResolvedValue({ success: true }),
}))

import { deleteMenuItem, toggleMenuItemActive } from '@/actions/menu'
import { toast } from 'sonner'

function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    created_at: '2024-01-01T00:00:00Z',
    name: 'Croissant',
    description: 'Buttery, flaky pastry',
    base_prep_time_minutes: 60,
    category: 'Pastry',
    is_active: true,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MenuItemCard', () => {
  it('renders the item name', () => {
    render(<MenuItemCard item={makeMenuItem()} />)
    expect(screen.getByText('Croissant')).toBeInTheDocument()
  })

  it('renders the item description', () => {
    render(<MenuItemCard item={makeMenuItem()} />)
    expect(screen.getByText('Buttery, flaky pastry')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<MenuItemCard item={makeMenuItem()} />)
    expect(screen.getByText('Pastry')).toBeInTheDocument()
  })

  it('renders the formatted prep time', () => {
    render(<MenuItemCard item={makeMenuItem({ base_prep_time_minutes: 90 })} />)
    expect(screen.getByText(/1h 30m per batch/)).toBeInTheDocument()
  })

  it('renders prep time in minutes when less than 60', () => {
    render(<MenuItemCard item={makeMenuItem({ base_prep_time_minutes: 45 })} />)
    expect(screen.getByText(/45m per batch/)).toBeInTheDocument()
  })

  it('applies opacity-60 class when item is inactive', () => {
    const { container } = render(<MenuItemCard item={makeMenuItem({ is_active: false })} />)
    expect(container.firstChild).toHaveClass('opacity-60')
  })

  it('does not apply opacity-60 class when item is active', () => {
    const { container } = render(<MenuItemCard item={makeMenuItem({ is_active: true })} />)
    expect(container.firstChild).not.toHaveClass('opacity-60')
  })

  it('renders "Inactive" badge when item is not active', () => {
    render(<MenuItemCard item={makeMenuItem({ is_active: false })} />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('does not render "Inactive" badge when item is active', () => {
    render(<MenuItemCard item={makeMenuItem({ is_active: true })} />)
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
  })

  it('does not render category badge when category is null', () => {
    render(<MenuItemCard item={makeMenuItem({ category: null })} />)
    expect(screen.queryByText('Pastry')).not.toBeInTheDocument()
  })

  it('does not render description when description is null', () => {
    render(<MenuItemCard item={makeMenuItem({ description: null })} />)
    expect(screen.queryByText('Buttery, flaky pastry')).not.toBeInTheDocument()
  })

  it('renders an edit link pointing to /menu/[id]/edit after opening dropdown', async () => {
    const user = userEvent.setup()
    render(<MenuItemCard item={makeMenuItem({ id: 'item-42' })} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    const editLink = await screen.findByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', '/menu/item-42/edit')
  })

  it('calls toggleMenuItemActive when deactivate is clicked', async () => {
    const user = userEvent.setup()
    render(<MenuItemCard item={makeMenuItem({ is_active: true })} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    const deactivateBtn = await screen.findByText('Deactivate')
    await user.click(deactivateBtn)
    await waitFor(() => {
      expect(toggleMenuItemActive).toHaveBeenCalledWith('item-1', false)
    })
  })

  it('shows "Activate" option when item is inactive', async () => {
    const user = userEvent.setup()
    render(<MenuItemCard item={makeMenuItem({ is_active: false })} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    expect(await screen.findByText('Activate')).toBeInTheDocument()
  })

  it('calls deleteMenuItem after confirm dialog accepted', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<MenuItemCard item={makeMenuItem({ name: 'Test Item' })} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    const deleteBtn = await screen.findByText('Delete')
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(deleteMenuItem).toHaveBeenCalledWith('item-1')
    })
  })

  it('does not call deleteMenuItem when confirm dialog rejected', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<MenuItemCard item={makeMenuItem()} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    const deleteBtn = await screen.findByText('Delete')
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(deleteMenuItem).not.toHaveBeenCalled()
    })
  })

  it('shows success toast on successful delete', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deleteMenuItem).mockResolvedValue({ success: true })

    render(<MenuItemCard item={makeMenuItem()} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    await user.click(await screen.findByText('Delete'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Item deleted')
    })
  })

  it('shows error toast when delete fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deleteMenuItem).mockResolvedValue({ success: false, error: 'Cannot delete' })

    render(<MenuItemCard item={makeMenuItem()} />)
    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)
    await user.click(await screen.findByText('Delete'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Cannot delete')
    })
  })
})
