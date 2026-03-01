'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration, sumPrepBlockMinutes } from '@/lib/utils/prep-time'
import { todayISO } from '@/lib/utils/dates'
import type { OrderFormValues } from '@/types/app'

interface PrepTimePlannerProps {
  totalPrepMinutes: number
}

const HOURS = Array.from({ length: 13 }, (_, i) => i) // 0–12
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

export function PrepTimePlanner({ totalPrepMinutes }: PrepTimePlannerProps) {
  const { register, control, watch, formState: { errors } } = useFormContext<OrderFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'prepBlocks' })

  const blocks = watch('prepBlocks') ?? []
  const plannedMinutes = sumPrepBlockMinutes(blocks)
  const remainingMinutes = totalPrepMinutes - plannedMinutes
  const isBalanced = remainingMinutes === 0 && totalPrepMinutes > 0

  function addBlock() {
    append({
      date: todayISO(),
      startTime: '09:00',
      durationHours: 1,
      durationMinutes: 0,
      label: '',
    })
  }

  if (totalPrepMinutes === 0) {
    return (
      <div className="text-white/40 text-sm text-center py-4 border border-dashed border-white/20 rounded-lg">
        Add menu items to plan prep time
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Total Prep: <span className="text-brand-gold">{formatDuration(totalPrepMinutes)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isBalanced ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Fully planned
            </span>
          ) : remainingMinutes > 0 ? (
            <span className="flex items-center gap-1 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              {formatDuration(remainingMinutes)} remaining
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-4 h-4" />
              Over by {formatDuration(Math.abs(remainingMinutes))}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            plannedMinutes > totalPrepMinutes ? 'bg-red-500' : 'bg-brand-gold'
          }`}
          style={{ width: `${Math.min(100, (plannedMinutes / totalPrepMinutes) * 100)}%` }}
        />
      </div>

      {/* Blocks */}
      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white/5 rounded-lg p-3 space-y-2">
              {/* Label */}
              <input
                type="text"
                placeholder="Label (e.g. Buttercream, Sponge layers)"
                {...register(`prepBlocks.${index}.label`)}
                className="h-8 w-full rounded-md border border-white/20 bg-white/5 px-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />

              {/* Date / time / duration / remove */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                {/* Date */}
                <input
                  type="date"
                  {...register(`prepBlocks.${index}.date`)}
                  className="h-9 w-full rounded-md border border-white/20 bg-brand-cream px-2 text-xs text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />

                {/* Start time */}
                <input
                  type="time"
                  {...register(`prepBlocks.${index}.startTime`)}
                  className="h-9 w-24 rounded-md border border-white/20 bg-brand-cream px-2 text-xs text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />

                {/* Duration */}
                <div className="flex items-center gap-1">
                  <select
                    {...register(`prepBlocks.${index}.durationHours`, { valueAsNumber: true })}
                    className="h-9 rounded-md border border-white/20 bg-brand-cream px-1.5 text-xs text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{h}h</option>
                    ))}
                  </select>
                  <select
                    {...register(`prepBlocks.${index}.durationMinutes`, { valueAsNumber: true })}
                    className="h-9 rounded-md border border-white/20 bg-brand-cream px-1.5 text-xs text-brand-bg focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}m</option>
                    ))}
                  </select>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addBlock} className="w-full">
        <Plus className="w-4 h-4 mr-1" />
        Add Prep Block
      </Button>

      {/* Validation error from parent form */}
      {(errors as Record<string, { message?: string }>).prepBlocksTotal?.message && (
        <p className="text-red-400 text-xs">
          {(errors as Record<string, { message?: string }>).prepBlocksTotal.message}
        </p>
      )}
    </div>
  )
}
