import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/db', () => ({
  db: () => ({ from: mockFrom, rpc: mockRpc }),
}))

import { updateOrderStatus, deleteOrder, updatePrepSchedule } from '@/actions/orders'
import { revalidatePath } from 'next/cache'

beforeEach(() => {
  vi.clearAllMocks()
})

const validPrepBlock = {
  date: '2024-06-15',
  startTime: '09:00',
  durationHours: 2,
  durationMinutes: 30,
  label: 'Morning bake',
}

describe('updateOrderStatus', () => {
  it('returns success when update succeeds', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    const result = await updateOrderStatus('order-1', 'confirmed')
    expect(result.success).toBe(true)
  })

  it('revalidates correct paths on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    await updateOrderStatus('order-42', 'completed')
    expect(revalidatePath).toHaveBeenCalledWith('/orders/order-42')
    expect(revalidatePath).toHaveBeenCalledWith('/orders')
  })

  it('returns error when db update fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    const result = await updateOrderStatus('order-1', 'cancelled')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Update failed')
  })

  it('works for all valid statuses', async () => {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const
    for (const status of statuses) {
      const eqMock = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })
      const result = await updateOrderStatus('order-1', status)
      expect(result.success).toBe(true)
    }
  })
})

describe('deleteOrder', () => {
  it('returns success when delete succeeds', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteOrder('order-1')
    expect(result.success).toBe(true)
  })

  it('revalidates /orders and /calendar on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    await deleteOrder('order-1')
    expect(revalidatePath).toHaveBeenCalledWith('/orders')
    expect(revalidatePath).toHaveBeenCalledWith('/calendar')
  })

  it('returns error when db delete fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteOrder('order-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Delete failed')
  })
})

describe('updatePrepSchedule', () => {
  it('returns error for invalid prep block data', async () => {
    const result = await updatePrepSchedule('order-1', [{ date: '', startTime: '', durationHours: 1, durationMinutes: 0 }])
    expect(result.success).toBe(false)
  })

  it('returns error when order is not found', async () => {
    // First call: select order
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqForSelect = vi.fn(() => ({ single: singleMock }))
    const selectMock = vi.fn(() => ({ eq: eqForSelect }))
    mockFrom.mockReturnValue({ select: selectMock })

    const result = await updatePrepSchedule('order-999', [validPrepBlock])
    expect(result.success).toBe(false)
    expect(result.error).toBe('Order not found')
  })

  it('returns error when deleting old prep events fails', async () => {
    // Select returns an order with a customers sub-object
    const singleMock = vi.fn().mockResolvedValue({
      data: { customers: { name: 'Jane' } },
      error: null,
    })
    const eqForSelect = vi.fn(() => ({ single: singleMock }))
    const selectMock = vi.fn(() => ({ eq: eqForSelect }))

    // Delete fails
    const eqForDelete = vi.fn().mockResolvedValue({ error: { message: 'Delete error' } })
    const eqForDeleteType = vi.fn(() => eqForDelete())
    // The delete chain: .delete().eq('order_id', id).eq('event_type', 'prep')
    const deleteChain = vi.fn(() => ({ eq: vi.fn(() => ({ eq: eqForDelete })) }))

    mockFrom
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ delete: deleteChain })

    const result = await updatePrepSchedule('order-1', [validPrepBlock])
    expect(result.success).toBe(false)
  })

  it('returns success with valid prep blocks', async () => {
    // Select order
    const singleMock = vi.fn().mockResolvedValue({
      data: { customers: { name: 'Jane Doe' } },
      error: null,
    })
    const eqForSelect = vi.fn(() => ({ single: singleMock }))
    const selectMock = vi.fn(() => ({ eq: eqForSelect }))

    // Delete existing prep events succeeds
    const eqForDeleteType = vi.fn().mockResolvedValue({ error: null })
    const eqForOrderId = vi.fn(() => ({ eq: eqForDeleteType }))
    const deleteChain = vi.fn(() => ({ eq: eqForOrderId }))

    // Insert new events succeeds
    const insertMock = vi.fn().mockResolvedValue({ error: null })

    mockFrom
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ delete: deleteChain })
      .mockReturnValueOnce({ insert: insertMock })

    const result = await updatePrepSchedule('order-1', [validPrepBlock])
    expect(result.success).toBe(true)
  })

  it('returns success with empty prep blocks (clears all prep events)', async () => {
    // Select order
    const singleMock = vi.fn().mockResolvedValue({
      data: { customers: { name: 'Jane Doe' } },
      error: null,
    })
    const eqForSelect = vi.fn(() => ({ single: singleMock }))
    const selectMock = vi.fn(() => ({ eq: eqForSelect }))

    // Delete succeeds, no insert needed
    const eqForDeleteType = vi.fn().mockResolvedValue({ error: null })
    const eqForOrderId = vi.fn(() => ({ eq: eqForDeleteType }))
    const deleteChain = vi.fn(() => ({ eq: eqForOrderId }))

    mockFrom
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ delete: deleteChain })

    const result = await updatePrepSchedule('order-1', [])
    expect(result.success).toBe(true)
  })

  it('revalidates order and calendar paths on success', async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: { customers: { name: 'Jane' } },
      error: null,
    })
    const eqForSelect = vi.fn(() => ({ single: singleMock }))
    const selectMock = vi.fn(() => ({ eq: eqForSelect }))

    const eqForDeleteType = vi.fn().mockResolvedValue({ error: null })
    const eqForOrderId = vi.fn(() => ({ eq: eqForDeleteType }))
    const deleteChain = vi.fn(() => ({ eq: eqForOrderId }))

    mockFrom
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ delete: deleteChain })

    await updatePrepSchedule('order-77', [])
    expect(revalidatePath).toHaveBeenCalledWith('/orders/order-77')
    expect(revalidatePath).toHaveBeenCalledWith('/calendar')
  })
})
