'use client'

import { useFormContext } from 'react-hook-form'
import { Trash2, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDuration } from '@/lib/utils/prep-time'
import type { MenuItem, OrderFormValues } from '@/types/app'

interface OrderItemRowProps {
  index: number
  menuItems: MenuItem[]
  onRemove: () => void
}

export function OrderItemRow({ index, menuItems, onRemove }: OrderItemRowProps) {
  const { register, watch, setValue } = useFormContext<OrderFormValues>()

  const selectedMenuItemId = watch(`orderItems.${index}.menuItemId`)
  const batches = watch(`orderItems.${index}.batches`) || 1
  const selectedItem = menuItems.find((m) => m.id === selectedMenuItemId)
  const prepMinutes = selectedItem ? selectedItem.base_prep_time_minutes * batches : 0

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Select
            value={selectedMenuItemId}
            onValueChange={(val) => setValue(`orderItems.${index}.menuItemId`, val)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select item…" />
            </SelectTrigger>
            <SelectContent>
              {menuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                  {item.category ? ` (${item.category})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors mt-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={`item-qty-${index}`} className="text-xs text-white/50">Quantity</label>
          <input
            id={`item-qty-${index}`}
            type="number"
            min="1"
            {...register(`orderItems.${index}.quantity`, { valueAsNumber: true })}
            className="h-9 w-full rounded-md border border-white/20 bg-brand-cream px-3 text-base text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`item-batches-${index}`} className="text-xs text-white/50">Batches</label>
          <input
            id={`item-batches-${index}`}
            type="number"
            min="1"
            {...register(`orderItems.${index}.batches`, { valueAsNumber: true })}
            className="h-9 w-full rounded-md border border-white/20 bg-brand-cream px-3 text-base text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
      </div>

      {prepMinutes > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-purple-400">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(prepMinutes)} prep ({batches} batch{batches > 1 ? 'es' : ''})</span>
        </div>
      )}

      <div>
        <label htmlFor={`item-notes-${index}`} className="text-xs text-white/50">Notes</label>
        <input
          id={`item-notes-${index}`}
          {...register(`orderItems.${index}.notes`)}
          placeholder="Special requirements…"
          className="mt-1 h-9 w-full rounded-md border border-white/20 bg-brand-cream px-3 text-base text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink placeholder:text-gray-400"
        />
      </div>
    </div>
  )
}
