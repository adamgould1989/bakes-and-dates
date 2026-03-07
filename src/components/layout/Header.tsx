interface HeaderProps {
  title: string
  action?: React.ReactNode
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-brand-surface/50 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-base md:text-xl font-bold text-white truncate">{title}</h1>
      {action && <div className="flex gap-2 items-center shrink-0">{action}</div>}
    </header>
  )
}
