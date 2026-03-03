import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache and next/navigation before importing actions
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

// Build a chainable Supabase mock
const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({ single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockSelect }))
const mockUpdate = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
const mockDelete = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/db', () => ({
  db: () => ({ from: mockFrom }),
}))

import { createCustomer, updateCustomer, deleteCustomer } from '@/actions/customers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

beforeEach(() => {
  vi.clearAllMocks()
})

// Helper to configure the mock chain for insert
function setupInsertSuccess(id: string) {
  const eqMock = vi.fn().mockResolvedValue({ data: { id }, error: null })
  const singleMock = vi.fn(() => eqMock()) // single returns the promise directly
  const selectMock = vi.fn(() => ({ single: () => Promise.resolve({ data: { id }, error: null }) }))
  const insertMock = vi.fn(() => ({ select: selectMock }))
  mockFrom.mockReturnValue({ insert: insertMock, update: mockUpdate, delete: mockDelete })
}

function setupDbError(operation: 'insert' | 'update' | 'delete') {
  const error = { message: 'DB error' }
  if (operation === 'insert') {
    const selectMock = vi.fn(() => ({ single: () => Promise.resolve({ data: null, error }) }))
    const insertMock = vi.fn(() => ({ select: selectMock }))
    mockFrom.mockReturnValue({ insert: insertMock })
  } else if (operation === 'update') {
    const eqMock = vi.fn().mockResolvedValue({ error })
    const updateMock = vi.fn(() => ({ eq: eqMock }))
    mockFrom.mockReturnValue({ update: updateMock })
  } else {
    const eqMock = vi.fn().mockResolvedValue({ error })
    const deleteMock = vi.fn(() => ({ eq: eqMock }))
    mockFrom.mockReturnValue({ delete: deleteMock })
  }
}

describe('createCustomer', () => {
  it('returns error for invalid data (missing name)', async () => {
    const result = await createCustomer({ name: '', email: 'test@test.com' })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error for invalid email', async () => {
    const result = await createCustomer({ name: 'Jane', email: 'not-an-email' })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/email/i)
  })

  it('calls redirect on successful creation', async () => {
    setupInsertSuccess('cust-123')
    await createCustomer({ name: 'Jane Doe', email: 'jane@example.com' })
    expect(redirect).toHaveBeenCalledWith('/customers/cust-123')
  })

  it('revalidates /customers on success', async () => {
    setupInsertSuccess('cust-123')
    await createCustomer({ name: 'Jane Doe' })
    expect(revalidatePath).toHaveBeenCalledWith('/customers')
  })

  it('returns error when db insert fails', async () => {
    setupDbError('insert')
    const result = await createCustomer({ name: 'Jane Doe' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })

  it('accepts valid data with all optional fields', async () => {
    setupInsertSuccess('cust-456')
    await createCustomer({
      name: 'John Baker',
      email: 'john@bakery.com',
      phone: '07700 900000',
      notes: 'Prefers morning delivery',
    })
    expect(redirect).toHaveBeenCalledWith('/customers/cust-456')
  })

  it('accepts empty email as valid (treated as no email)', async () => {
    setupInsertSuccess('cust-789')
    await createCustomer({ name: 'No Email Person', email: '' })
    expect(redirect).toHaveBeenCalledWith('/customers/cust-789')
  })
})

describe('updateCustomer', () => {
  it('returns error for missing name', async () => {
    const result = await updateCustomer('cust-1', { name: '' })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error for invalid email', async () => {
    const result = await updateCustomer('cust-1', { name: 'Jane', email: 'bad-email' })
    expect(result.success).toBe(false)
  })

  it('returns success on valid update', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn(() => ({ eq: eqMock }))
    mockFrom.mockReturnValue({ update: updateMock })

    const result = await updateCustomer('cust-1', { name: 'Jane Doe' })
    expect(result.success).toBe(true)
  })

  it('revalidates paths on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: vi.fn(() => ({ eq: eqMock })) })

    await updateCustomer('cust-99', { name: 'Jane' })
    expect(revalidatePath).toHaveBeenCalledWith('/customers/cust-99')
    expect(revalidatePath).toHaveBeenCalledWith('/customers')
  })

  it('returns error when db update fails', async () => {
    setupDbError('update')
    const result = await updateCustomer('cust-1', { name: 'Jane' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('deleteCustomer', () => {
  it('returns success when delete succeeds', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    const result = await deleteCustomer('cust-1')
    expect(result.success).toBe(true)
  })

  it('revalidates /customers on success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ delete: vi.fn(() => ({ eq: eqMock })) })

    await deleteCustomer('cust-1')
    expect(revalidatePath).toHaveBeenCalledWith('/customers')
  })

  it('returns error when db delete fails', async () => {
    setupDbError('delete')
    const result = await deleteCustomer('cust-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})
