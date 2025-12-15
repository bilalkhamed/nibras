export function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="h-10 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
        {/* Table Header */}
        <div className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-4">
          <div className="flex gap-4">
            <div className="h-5 w-8 animate-pulse rounded bg-muted" />
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 border-t border-border p-4 odd:bg-muted/40 even:bg-card"
          >
            <div className="h-5 w-8 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-32 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted/60" />
            <div className="h-9 w-20 animate-pulse rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
