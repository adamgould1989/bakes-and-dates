import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MenuItemForm } from '@/components/menu/MenuItemForm'
import { Card, CardContent } from '@/components/ui/card'

export default function NewMenuItemPage() {
  return (
    <>
      <Header title="New Menu Item" />
      <div className="p-4 md:p-6 max-w-lg">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Menu
        </Link>
        <Card>
          <CardContent className="p-6">
            <MenuItemForm />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
