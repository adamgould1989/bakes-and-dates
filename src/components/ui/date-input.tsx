'use client'

import { forwardRef, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Input } from './input'

type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

/**
 * Drop-in replacement for <Input type="date"> that:
 * - Constrains width to its container (fixes iOS Safari overflow via min-w-0)
 * - Blurs on change so iOS dismisses the native date picker without requiring
 *   a separate "Done" tap — but skips the blur when iOS auto-fires onChange
 *   with today's date on first open of an empty field.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ onChange, onFocus, className, ...props }, ref) => {
    // Track whether the picker was opened while the field was empty.
    // iOS immediately fires onChange with today's date as the default when
    // opening a date picker on an empty field. We skip the auto-blur for that
    // first synthetic change so the picker stays open for the user to select.
    const openedEmpty = useRef(false)

    return (
      <Input
        type="date"
        ref={ref}
        className={cn('min-w-0', className)}
        onFocus={(e) => {
          openedEmpty.current = !e.target.value
          onFocus?.(e)
        }}
        onChange={(e) => {
          onChange?.(e)
          if (e.target.value) {
            if (openedEmpty.current) {
              // iOS auto-initialized the picker to today on an empty field.
              // Keep the picker open so the user can make their selection.
              openedEmpty.current = false
            } else {
              // User changed the date — dismiss the picker.
              const t = e.target
              setTimeout(() => t.blur(), 0)
            }
          }
        }}
        {...props}
      />
    )
  }
)
DateInput.displayName = 'DateInput'
