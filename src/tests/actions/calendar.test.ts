import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/db', () => ({
  db: () => ({ from: mockFrom }),
}))

import { createUnavailabilityBlock, deleteCalendarEvent } from '@/actions/calendar'
import { revalidatePath } from 'next/cache'

beforeEach(() => {
  vi.clearAllMocks()
})

const validBlock = {
  title: 'Holiday',
  start_time: '2024-06-15T00:00:00Z',
  end_time: '2024-06-16T00:00:00Z',
  is_all_day: true,
  notes: 'Away',
}

function setupInsertSuccess(id: string) {
  const singleMock = vi.fn().mockResolvedValue({ data: { id }, error: null })
  const selectMock = vi.fn(() => ({ single: singleMock }))
  const insertMock = vi.fn(() => ({ select: selectMock }))
  mockFrom.mockReturnValue({ insert: insertMock })
}

describe('createUnavailabilityBlock', () => {
  it('returns error when title is missing', async () => {
    const result = await createUnavailabilityBlock({
      ...validBlock,
      title: '',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when start_time is missing', async () => {
    const result = await createUnavailabilityBlock({
      ...validBlock,
      start_time: '',
    })
    expect(result.success).toBe(false)
  })

  it('returns error when end_time is missing', async () => {
    const result = await createUnavailabilityBlock({
      ...validBlock,
      end_time: '',
    })
    expect(result.success).toBe(false)
  })

  it('returns success with id on valid block', async () => {
    setupInsertSuccess('evt-123')
    const result = await createUnavailabilityBlock(validBlock)
    expect(result.success).toBe(true)
    expect(result.id).toBe('evt-123')
  })

  it('revalidates /calendar on success', async () => {
    setupInsertSuccess('evt-456')
    await createUnavailabilityBlock(validBlock)
    expect(revalidatePath).toHaveBeenCalledWith('/calendar')
  })

  it('returns error when db insert fails', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const selectMock = vi.fn(() => ({ single: singleMock }))
    mockFrom.mockReturnValue({ insert: vi.fn(() => ({ select: selectMock })) })

    const result = await createUnavailabilityBlock(validBlock)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Insert failed')
  })

  it('uses default title "Unavailable" if not provided', async () => {
    setupInsertSuccess('evt-789')
    const { title: _, ...blockWithoutTitle } = validBlock
    const result = await createUnavailabilityBlock({ ...blockWithoutTitle, title: 'Unavailable' })
    expect(result.success).toBe(true)
  })

  it('accepts optional notes as undefined', async () => {
    setupInsertSuccess('evt-999')
    const result = await createUnavailabilityBlock({
      title: 'No Notes Block',
      start_time: '2024-06-15T00:00:00Z',
      end_time: '2024-06-16T00:00:00Z',
      is_all_day: false,
    })
    expect(result.success).toBe(true)
  })
})

describe('deleteCalendarEvent', () => {
  it('returns success when delete succeeds', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteCalendarEvent('evt-1')
    expect(result.success).toBe(true)
  })

  it('revalidates /calendar on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    await deleteCalendarEvent('evt-1')
    expect(revalidatePath).toHaveBeenCalledWith('/calendar')
  })

  it('returns error when db delete fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteCalendarEvent('evt-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Delete failed')
  })
})
