import type { MenuItem, PrepBlock } from '@/types/app'

export function calculateTotalPrepMinutes(
  items: { menuItemId: string; batches: number }[],
  menuItems: MenuItem[]
): number {
  return items.reduce((total, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)
    if (!menuItem) return total
    return total + menuItem.base_prep_time_minutes * item.batches
  }, 0)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function prepBlockToCalendarTimes(block: PrepBlock): {
  start: string
  end: string
} {
  const [year, month, day] = block.date.split('-').map(Number)
  const [hours, minutes] = block.startTime.split(':').map(Number)
  const durationMinutes = block.durationHours * 60 + block.durationMinutes

  const start = new Date(year, month - 1, day, hours, minutes)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export function sumPrepBlockMinutes(blocks: PrepBlock[]): number {
  return blocks.reduce((sum, b) => sum + b.durationHours * 60 + b.durationMinutes, 0)
}
