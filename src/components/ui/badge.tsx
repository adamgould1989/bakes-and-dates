import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-gold text-brand-bg',
        pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        confirmed: 'bg-green-500/20 text-green-300 border border-green-500/30',
        completed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
        deadline: 'bg-red-600 text-white',
        prep: 'bg-purple-600 text-white',
        delivery: 'bg-blue-600 text-white',
        unavailable: 'bg-gray-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
