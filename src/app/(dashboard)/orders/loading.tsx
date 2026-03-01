export default function OrdersLoading() {
  return (
    <div className="p-4 md:p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-lg bg-white/5 animate-pulse border border-white/10"
        />
      ))}
    </div>
  )
}
