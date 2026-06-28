import { Suspense } from 'react';
import { CustomAlert } from '@/components/common/custom-alert';
import { getAllArticlesAdmin } from '@/features/articles/service/queries';
import { ArticlesTable } from '@/features/articles/components';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import getAuthSession from '@/lib/server/auth-session';

export default async function ArticlesPage() {
  return (
    <AuthGuard roles={['media_team', 'admin', 'director']}>
      <Suspense fallback={<ArticlesPageSkeleton />}>
        <ArticlesContent />
      </Suspense>
    </AuthGuard>
  );
}

async function ArticlesContent() {
  const session = await getAuthSession();
  const result = await getAllArticlesAdmin();

  if (!result.success) {
    return (
      <CustomAlert
        variant="destructive"
        title="خطأ"
        description="حدث خطأ أثناء تحميل المقالات. الرجاء المحاولة مرة أخرى."
      />
    );
  }

  return <ArticlesTable articles={result.data} isDirector={session?.role === 'director'} />;
}

function ArticlesPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-35" />
        <Skeleton className="h-10 w-35" />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
