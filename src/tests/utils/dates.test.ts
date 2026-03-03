import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate, formatDateTime, toISODateString, todayISO } from '@/lib/utils/dates'

describe('formatDate', () => {
  it('formats an ISO date string with default pattern', () => {
    expect(formatDate('2024-06-15')).toBe('15 Jun 2024')
  })

  it('formats a Date object with default pattern', () => {
    const date = new Date(2024, 5, 15) // June 15 2024
    expect(formatDate(date)).toBe('15 Jun 2024')
  })

  it('formats with a custom pattern', () => {
    expect(formatDate('2024-12-01', 'MM/dd/yyyy')).toBe('12/01/2024')
  })

  it('returns an empty string for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('formats single-digit day correctly', () => {
    expect(formatDate('2024-01-05')).toBe('05 Jan 2024')
  })

  it('handles December correctly', () => {
    expect(formatDate('2024-12-31')).toBe('31 Dec 2024')
  })
})

describe('formatDateTime', () => {
  it('formats an ISO datetime string', () => {
    // Use a fixed local datetime: Jan 1 2024 at 14:30
    const result = formatDateTime('2024-01-01T14:30:00')
    expect(result).toBe('01 Jan 2024, 14:30')
  })

  it('formats a Date object with time', () => {
    const date = new Date(2024, 0, 1, 9, 5) // Jan 1 2024, 09:05
    expect(formatDateTime(date)).toBe('01 Jan 2024, 09:05')
  })

  it('returns empty string for invalid date', () => {
    expect(formatDateTime('bad-date')).toBe('')
  })
})

describe('toISODateString', () => {
  it('returns yyyy-MM-dd format', () => {
    const date = new Date(2024, 5, 15) // June 15 2024
    expect(toISODateString(date)).toBe('2024-06-15')
  })

  it('pads month and day with leading zeros', () => {
    const date = new Date(2024, 0, 5) // Jan 5 2024
    expect(toISODateString(date)).toBe('2024-01-05')
  })

  it('handles end of year correctly', () => {
    const date = new Date(2024, 11, 31) // Dec 31 2024
    expect(toISODateString(date)).toBe('2024-12-31')
  })
})

describe('todayISO', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns today\'s date in yyyy-MM-dd format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 5, 15)) // June 15 2024
    expect(todayISO()).toBe('2024-06-15')
  })

  it('returns a string matching yyyy-MM-dd pattern', () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
