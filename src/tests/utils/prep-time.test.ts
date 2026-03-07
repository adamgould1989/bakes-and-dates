import { describe, it, expect } from 'vitest'
import {
  calculateTotalPrepMinutes,
  formatDuration,
  prepBlockToCalendarTimes,
  sumPrepBlockMinutes,
} from '@/lib/utils/prep-time'
import type { MenuItem, PrepBlock } from '@/types/app'

// Minimal MenuItem factory
function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    created_at: '2024-01-01T00:00:00Z',
    name: 'Test Item',
    description: null,
    base_prep_time_minutes: 60,
    category: null,
    is_active: true,
    price: null,
    ...overrides,
  }
}

describe('calculateTotalPrepMinutes', () => {
  it('returns 0 when no items are provided', () => {
    expect(calculateTotalPrepMinutes([], [])).toBe(0)
  })

  it('returns 0 when no matching menu items are found', () => {
    const items = [{ menuItemId: 'nonexistent-id', batches: 2 }]
    const menuItems = [makeMenuItem({ id: 'item-1' })]
    expect(calculateTotalPrepMinutes(items, menuItems)).toBe(0)
  })

  it('calculates prep time for a single item with one batch', () => {
    const menuItem = makeMenuItem({ id: 'item-1', base_prep_time_minutes: 45 })
    const items = [{ menuItemId: 'item-1', batches: 1 }]
    expect(calculateTotalPrepMinutes(items, [menuItem])).toBe(45)
  })

  it('multiplies prep time by number of batches', () => {
    const menuItem = makeMenuItem({ id: 'item-1', base_prep_time_minutes: 30 })
    const items = [{ menuItemId: 'item-1', batches: 3 }]
    expect(calculateTotalPrepMinutes(items, [menuItem])).toBe(90)
  })

  it('sums prep time across multiple items', () => {
    const menuItems = [
      makeMenuItem({ id: 'item-1', base_prep_time_minutes: 60 }),
      makeMenuItem({ id: 'item-2', base_prep_time_minutes: 30 }),
    ]
    const items = [
      { menuItemId: 'item-1', batches: 2 },
      { menuItemId: 'item-2', batches: 1 },
    ]
    // 60*2 + 30*1 = 150
    expect(calculateTotalPrepMinutes(items, menuItems)).toBe(150)
  })

  it('skips items whose menu item is not in the list', () => {
    const menuItem = makeMenuItem({ id: 'item-1', base_prep_time_minutes: 60 })
    const items = [
      { menuItemId: 'item-1', batches: 1 },
      { menuItemId: 'unknown', batches: 5 },
    ]
    expect(calculateTotalPrepMinutes(items, [menuItem])).toBe(60)
  })
})

describe('formatDuration', () => {
  it('returns only minutes when less than 60 minutes', () => {
    expect(formatDuration(30)).toBe('30m')
  })

  it('returns only hours when exactly divisible by 60', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('returns hours and minutes for mixed duration', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('returns 0m for zero minutes', () => {
    expect(formatDuration(0)).toBe('0m')
  })

  it('returns 1h for exactly 60 minutes', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('handles large values correctly', () => {
    // 3h 45m = 225 minutes
    expect(formatDuration(225)).toBe('3h 45m')
  })

  it('handles single digit minutes with hours', () => {
    expect(formatDuration(61)).toBe('1h 1m')
  })
})

describe('prepBlockToCalendarTimes', () => {
  const baseBlock: PrepBlock = {
    date: '2024-06-15',
    startTime: '09:00',
    durationHours: 2,
    durationMinutes: 30,
  }

  it('produces ISO string start and end times', () => {
    const { start, end } = prepBlockToCalendarTimes(baseBlock)
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('end time is start time + duration', () => {
    const { start, end } = prepBlockToCalendarTimes(baseBlock)
    const startMs = new Date(start).getTime()
    const endMs = new Date(end).getTime()
    const durationMs = (baseBlock.durationHours * 60 + baseBlock.durationMinutes) * 60 * 1000
    expect(endMs - startMs).toBe(durationMs)
  })

  it('handles zero-minute duration', () => {
    const block: PrepBlock = { date: '2024-06-15', startTime: '10:00', durationHours: 1, durationMinutes: 0 }
    const { start, end } = prepBlockToCalendarTimes(block)
    const diff = new Date(end).getTime() - new Date(start).getTime()
    expect(diff).toBe(60 * 60 * 1000)
  })

  it('handles zero-hour duration', () => {
    const block: PrepBlock = { date: '2024-06-15', startTime: '10:00', durationHours: 0, durationMinutes: 45 }
    const { start, end } = prepBlockToCalendarTimes(block)
    const diff = new Date(end).getTime() - new Date(start).getTime()
    expect(diff).toBe(45 * 60 * 1000)
  })

  it('correctly parses the date into the start time', () => {
    const block: PrepBlock = { date: '2024-03-20', startTime: '14:30', durationHours: 1, durationMinutes: 0 }
    const { start } = prepBlockToCalendarTimes(block)
    const d = new Date(start)
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(2) // 0-indexed March
    expect(d.getDate()).toBe(20)
    expect(d.getHours()).toBe(14)
    expect(d.getMinutes()).toBe(30)
  })
})

describe('sumPrepBlockMinutes', () => {
  it('returns 0 for an empty array', () => {
    expect(sumPrepBlockMinutes([])).toBe(0)
  })

  it('calculates total minutes from a single block', () => {
    const blocks: PrepBlock[] = [
      { date: '2024-01-01', startTime: '09:00', durationHours: 1, durationMinutes: 30 },
    ]
    expect(sumPrepBlockMinutes(blocks)).toBe(90)
  })

  it('sums minutes across multiple blocks', () => {
    const blocks: PrepBlock[] = [
      { date: '2024-01-01', startTime: '09:00', durationHours: 2, durationMinutes: 0 },
      { date: '2024-01-02', startTime: '10:00', durationHours: 0, durationMinutes: 45 },
      { date: '2024-01-03', startTime: '11:00', durationHours: 1, durationMinutes: 15 },
    ]
    // 120 + 45 + 75 = 240
    expect(sumPrepBlockMinutes(blocks)).toBe(240)
  })

  it('handles blocks with only hours', () => {
    const blocks: PrepBlock[] = [
      { date: '2024-01-01', startTime: '09:00', durationHours: 3, durationMinutes: 0 },
    ]
    expect(sumPrepBlockMinutes(blocks)).toBe(180)
  })

  it('handles blocks with only minutes', () => {
    const blocks: PrepBlock[] = [
      { date: '2024-01-01', startTime: '09:00', durationHours: 0, durationMinutes: 45 },
    ]
    expect(sumPrepBlockMinutes(blocks)).toBe(45)
  })
})
