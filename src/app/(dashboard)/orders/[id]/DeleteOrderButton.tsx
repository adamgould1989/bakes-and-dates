'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteOrder } from '@/actions/orders'

interface DeleteOrderButtonProps {
  orderId: string
}

export function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()

  async function executeDelete() {
    setDeleting(true)
    const result = await deleteOrder(orderId)
    if (result.success) {
      toast.success('Order deleted')
      router.push('/orders')
    } else {
      toast.error(result.error ?? 'Could not delete order')
      setDeleting(false)
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)} disabled={deleting}>
        <Trash2 className="w-4 h-4 mr-1" />
        {deleting ? 'Deleting…' : 'Delete Order'}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete order?"
        description="This will permanently delete this order and all its calendar events. This cannot be undone."
        onConfirm={executeDelete}
      />
    </>
  )
}
