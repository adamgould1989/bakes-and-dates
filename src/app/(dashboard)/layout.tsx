import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar />
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
