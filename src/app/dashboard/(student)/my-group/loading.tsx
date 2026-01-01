import { CardsListSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Skeleton className="h-32 rounded-3xl" />

      {/* Group Info Skeleton */}
      <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4 dark:border-primary/25 dark:bg-[#15101f]">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-12 rounded-xl" />
      </div>

      {/* Supervisor Skeleton */}
      <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4 dark:border-primary/25 dark:bg-[#15101f]">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Students Grid Skeleton */}
      <CardsListSkeleton numberOfCards={6} />
    </div>
  );
}
