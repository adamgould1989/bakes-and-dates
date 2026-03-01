import { db } from '@/lib/supabase/db'
import { MenuPageClient } from './MenuPageClient'
import type { MenuItem } from '@/types/app'

export default async function MenuPage() {
  const { data } = await db()
    .from('menu_items')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return <MenuPageClient menuItems={(data ?? []) as MenuItem[]} />
}
