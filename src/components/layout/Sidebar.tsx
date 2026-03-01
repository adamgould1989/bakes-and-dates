'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, ShoppingBag, Users, UtensilsCrossed, LogOut, Cake } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { browserDb } from '@/lib/supabase/browser-db'
import { toast } from 'sonner'

const navItems = [
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = browserDb()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex w-64 flex-col bg-brand-surface border-r border-white/10 h-screen fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
            <Cake className="w-5 h-5 text-brand-gold" />
          </div>
          <div>
            <p className="font-bold text-brand-gold text-sm leading-tight">Bakes & Dates</p>
            <p className="text-white/40 text-xs">LaLa&apos;s Calendar</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-gold text-brand-bg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
