import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function WeekCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-muted-foreground/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function CalendarLoading() {
  return (
    <div className="container  mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>

        {/* Timeline skeleton */}
        <div className="relative">
          {/* Timeline line - desktop only */}
          <div className="absolute right-6.75 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/20 via-primary/10 to-muted hidden md:block" />

          {/* Week cards skeleton */}
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative flex items-start">
                {/* Timeline dot - desktop only */}
                <div className="absolute right-4 top-6 hidden md:flex items-center justify-center">
                  <Skeleton className="size-6 rounded-full" />
                </div>

                {/* Card container */}
                <div className="w-full md:pr-14">
                  <WeekCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
