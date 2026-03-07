'use client'

import { useState } from 'react'
import { Clock, Pencil, Trash2, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { deleteMenuItem, toggleMenuItemActive } from '@/actions/menu'
import { formatDuration } from '@/lib/utils/prep-time'
import type { MenuItem } from '@/types/app'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function executeDelete() {
    setDeleting(true)
    const result = await deleteMenuItem(item.id)
    if (result.success) {
      toast.success('Item deleted')
    } else {
      toast.error(result.error ?? 'Could not delete item')
      setDeleting(false)
    }
  }

  async function handleToggleActive() {
    const result = await toggleMenuItemActive(item.id, !item.is_active)
    if (!result.success) toast.error(result.error ?? 'Error')
  }

  return (
    <Card className={!item.is_active ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white truncate">{item.name}</h3>
              {item.category && (
                <Badge variant="default" className="text-xs shrink-0">
                  {item.category}
                </Badge>
              )}
              {!item.is_active && (
                <Badge className="text-xs bg-gray-600 text-white shrink-0">Inactive</Badge>
              )}
            </div>

            {item.description && (
              <p className="text-white/60 text-sm mt-1 line-clamp-2">{item.description}</p>
            )}

            <div className="flex items-center gap-1 mt-2 text-white/50 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(item.base_prep_time_minutes)} per batch</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/menu/${item.id}/edit`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                {item.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${item.name}"?`}
        description="This will permanently remove this menu item."
        onConfirm={executeDelete}
      />
    </Card>
  )
}
