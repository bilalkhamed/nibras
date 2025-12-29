export function AssignmentsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
        {/* Table Header */}
        <div className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-4">
          <div className="flex gap-4">
            <div className="h-5 w-8 animate-pulse rounded bg-muted" />
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 border-t border-border p-4 odd:bg-muted/40 even:bg-card"
          >
            <div className="h-5 w-8 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-32 animate-pulse rounded bg-muted/60" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted/60" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
            <div className="h-5 w-28 animate-pulse rounded bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
