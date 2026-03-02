import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import type { MenuItem } from '@/types/app'

interface MenuPageClientProps {
  menuItems: MenuItem[]
}

export function MenuPageClient({ menuItems }: MenuPageClientProps) {
  const grouped = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.category ?? 'Uncategorised'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <>
      <Header
        title="Menu"
        action={
          <Button size="sm" asChild>
            <Link href="/menu/new">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Link>
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {menuItems.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No menu items yet</p>
            <p className="text-sm mt-1">Add your first bake to get started</p>
            <Button className="mt-4" asChild>
              <Link href="/menu/new">
                <Plus className="w-4 h-4 mr-1" />
                Add Menu Item
              </Link>
            </Button>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
