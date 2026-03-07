'use client'

import { forwardRef } from 'react'
import { Input } from './input'

type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

/**
 * Drop-in replacement for <Input type="date"> that:
 * - Constrains width to its container (fixes iOS Safari overflow)
 * - Blurs immediately on change so iOS dismisses the native date picker
 *   without requiring a separate "Done" tap
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ onChange, ...props }, ref) => (
    <Input
      type="date"
      ref={ref}
      onChange={(e) => {
        onChange?.(e)
        if (e.target.value) {
          const t = e.target
          setTimeout(() => t.blur(), 0)
        }
      }}
      {...props}
    />
  )
)
DateInput.displayName = 'DateInput'
