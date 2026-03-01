export default function CustomersLoading() {
  return (
    <div className="p-4 md:p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-lg bg-white/5 animate-pulse border border-white/10"
        />
      ))}
    </div>
  )
}
