import { UsersTableSkeleton } from '@/components/skeletons';

export default function LoadingCohortDetail() {
  return (
    <div className="space-y-8" dir="rtl">
      {/* Header Loading Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-muted animate-pulse rounded mt-2" />
          {/* Subtitle skeleton */}
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        </div>
        {/* Action Buttons skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Stats Cards Loading Skeleton with grouping */}
      <div className="space-y-6">
        {/* Identity Info Row Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded mr-1" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-6 bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-36 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* People Stats Row Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded mr-1" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-6 bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-36 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Loading Skeleton */}
      <div className="space-y-4">
        <div className="border-t border-border pt-6">
          <UsersTableSkeleton />
        </div>
      </div>
    </div>
  );
}
