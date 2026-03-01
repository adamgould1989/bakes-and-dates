'use client'

import { useState } from 'react'
import { Clock, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  onEdit: (item: MenuItem) => void
}

export function MenuItemCard({ item, onEdit }: MenuItemCardProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"?`)) return
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
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                {item.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
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
    </Card>
  )
}
