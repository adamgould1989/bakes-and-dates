import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cake } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="text-center">
        <Cake className="w-16 h-16 text-brand-gold/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">404 — Page not found</h2>
        <p className="text-white/60 text-sm mb-6">This page doesn&apos;t exist or has been moved.</p>
        <Link href="/calendar">
          <Button>Back to Calendar</Button>
        </Link>
      </div>
    </div>
  )
}
