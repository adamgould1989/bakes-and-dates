import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/db', () => ({
  db: () => ({ from: mockFrom }),
}))

import { createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemActive, getMenuItems } from '@/actions/menu'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

beforeEach(() => {
  vi.clearAllMocks()
})

function setupInsertSuccess(id: string) {
  const selectMock = vi.fn(() => ({ single: () => Promise.resolve({ data: { id }, error: null }) }))
  mockFrom.mockReturnValue({ insert: vi.fn(() => ({ select: selectMock })) })
}

function setupDbError() {
  const eqMock = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
  mockFrom.mockReturnValue({
    insert: vi.fn(() => ({ select: vi.fn(() => ({ single: () => Promise.resolve({ data: null, error: { message: 'DB error' } }) })) })),
    update: vi.fn(() => ({ eq: eqMock })),
    delete: vi.fn(() => ({ eq: eqMock })),
  })
}

describe('createMenuItem', () => {
  it('returns error for missing name', async () => {
    const result = await createMenuItem({ name: '', base_prep_time_minutes: 30 })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/name/i)
  })

  it('returns error for negative prep time', async () => {
    const result = await createMenuItem({ name: 'Cake', base_prep_time_minutes: -1 })
    expect(result.success).toBe(false)
  })

  it('redirects to /menu on success', async () => {
    setupInsertSuccess('item-1')
    await createMenuItem({ name: 'Croissant', base_prep_time_minutes: 60 })
    expect(redirect).toHaveBeenCalledWith('/menu')
  })

  it('revalidates /menu on success', async () => {
    setupInsertSuccess('item-2')
    await createMenuItem({ name: 'Bread', base_prep_time_minutes: 90 })
    expect(revalidatePath).toHaveBeenCalledWith('/menu')
  })

  it('accepts valid data with optional fields', async () => {
    setupInsertSuccess('item-3')
    await createMenuItem({
      name: 'Sourdough',
      description: 'Tangy bread',
      base_prep_time_minutes: 120,
      category: 'Bread',
      is_active: true,
    })
    expect(redirect).toHaveBeenCalledWith('/menu')
  })

  it('returns error when db insert fails', async () => {
    setupDbError()
    const result = await createMenuItem({ name: 'Cake', base_prep_time_minutes: 30 })
    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('updateMenuItem', () => {
  it('returns error for invalid data', async () => {
    const result = await updateMenuItem('item-1', { name: '' })
    expect(result.success).toBe(false)
  })

  it('returns success on valid update', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    const result = await updateMenuItem('item-1', { name: 'Updated Cake', base_prep_time_minutes: 45 })
    expect(result.success).toBe(true)
  })

  it('revalidates /menu on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    await updateMenuItem('item-1', { name: 'Cake', base_prep_time_minutes: 30 })
    expect(revalidatePath).toHaveBeenCalledWith('/menu')
  })

  it('returns error when db update fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    const result = await updateMenuItem('item-1', { name: 'Cake', base_prep_time_minutes: 30 })
    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('deleteMenuItem', () => {
  it('returns success when delete succeeds', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteMenuItem('item-1')
    expect(result.success).toBe(true)
  })

  it('revalidates /menu on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    await deleteMenuItem('item-1')
    expect(revalidatePath).toHaveBeenCalledWith('/menu')
  })

  it('returns error when db delete fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteMenuItem('item-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Delete failed')
  })
})

describe('toggleMenuItemActive', () => {
  it('returns success when toggle succeeds', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    const result = await toggleMenuItemActive('item-1', false)
    expect(result.success).toBe(true)
  })

  it('revalidates /menu on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    await toggleMenuItemActive('item-1', true)
    expect(revalidatePath).toHaveBeenCalledWith('/menu')
  })

  it('returns error when db update fails', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Toggle failed' } })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    const result = await toggleMenuItemActive('item-1', false)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Toggle failed')
  })
})

describe('getMenuItems', () => {
  it('returns menu items from db', async () => {
    const items = [
      { id: 'item-1', name: 'Croissant', base_prep_time_minutes: 60 },
      { id: 'item-2', name: 'Bread', base_prep_time_minutes: 90 },
    ]
    const orderMock = vi.fn().mockResolvedValue({ data: items, error: null })
    const selectMock = vi.fn(() => ({ order: orderMock }))
    mockFrom.mockReturnValue({ select: selectMock })

    const result = await getMenuItems()
    expect(result).toEqual(items)
  })

  it('returns empty array when db returns null', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const selectMock = vi.fn(() => ({ order: orderMock }))
    mockFrom.mockReturnValue({ select: selectMock })

    const result = await getMenuItems()
    expect(result).toEqual([])
  })
})
