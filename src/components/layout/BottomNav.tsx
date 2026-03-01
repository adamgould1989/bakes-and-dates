'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, ShoppingBag, Users, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-surface border-t border-white/10 safe-area-pb">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors min-h-[56px]',
                active ? 'text-brand-gold' : 'text-white/50'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
