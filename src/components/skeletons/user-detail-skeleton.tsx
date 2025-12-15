import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function UserDetailSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Account Information Section */}
      <section>
        <Skeleton className='h-7 w-48 mb-3' />
        <Card className='border-border bg-card/80'>
          <CardContent className='p-4 md:p-6 space-y-4'>
            {/* Name and badges */}
            <div className='flex flex-wrap items-center gap-3'>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-7 w-20 rounded-full' />
              <Skeleton className='h-7 w-20 rounded-full' />
            </div>

            {/* Info fields grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className='space-y-2'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-10 w-full rounded-lg' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Admin Actions Section */}
      <section>
        <Skeleton className='h-7 w-40 mb-3' />
        <Card className='border-border bg-card/80'>
          <CardContent className='p-4 md:p-6 flex flex-wrap gap-3'>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className='h-10 w-32' />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Role-specific sections */}
      <div className='space-y-4'>
        {/* Current Group Section */}
        <section>
          <Skeleton className='h-7 w-48 mb-3' />
          <Card className='border-border bg-card/80'>
            <CardContent className='p-4 md:p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className='space-y-2'>
                    <Skeleton className='h-3 w-24' />
                    <Skeleton className='h-10 w-full rounded-lg' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* History Section */}
        <section>
          <Skeleton className='h-7 w-40 mb-3' />
          <Card className='border-border bg-card/80'>
            <CardContent className='p-4 md:p-6 space-y-3'>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className='rounded-lg border border-border bg-muted/40 p-3 shadow-sm space-y-2'
                >
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-40' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
