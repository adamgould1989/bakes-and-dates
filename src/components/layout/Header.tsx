import { Cake } from 'lucide-react'

interface HeaderProps {
  title: string
  action?: React.ReactNode
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-brand-surface/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Mobile brand mark */}
      <div className="md:hidden flex items-center gap-2">
        <Cake className="w-5 h-5 text-brand-gold" />
        <span className="font-bold text-brand-gold text-sm">Bakes & Dates</span>
      </div>

      {/* Desktop title */}
      <h1 className="hidden md:block text-xl font-bold text-white">{title}</h1>

      {action && <div>{action}</div>}
    </header>
  )
}
