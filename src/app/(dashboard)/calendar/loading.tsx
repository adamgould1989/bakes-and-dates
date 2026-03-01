export default function CalendarLoading() {
  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 border-b border-white/10 animate-pulse bg-white/5" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading calendar…</div>
      </div>
    </div>
  )
}
