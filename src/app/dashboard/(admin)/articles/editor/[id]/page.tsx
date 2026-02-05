import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CustomAlert } from '@/components/common/custom-alert';
import { getArticleById } from '@/features/articles/service/queries';
import { ArticleForm } from '@/features/articles/components';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type ArticleEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ArticleEditorPage({
  params,
}: ArticleEditorPageProps) {
  const { id } = await params;
  const isNew = id === 'new';

  return (
    <Suspense fallback={<ArticleEditorSkeleton />}>
      <ArticleEditorContent id={id} isNew={isNew} />
    </Suspense>
  );
}

async function ArticleEditorContent({
  id,
  isNew,
}: {
  id: string;
  isNew: boolean;
}) {
  if (isNew) {
    return <ArticleForm mode="create" />;
  }

  const result = await getArticleById(id);

  if (!result.success) {
    return (
      <CustomAlert
        variant="destructive"
        title="خطأ"
        description="حدث خطأ أثناء تحميل المقال. الرجاء المحاولة مرة أخرى."
      />
    );
  }

  if (!result.data) {
    notFound();
  }

  return <ArticleForm mode="edit" article={result.data} />;
}

function ArticleEditorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-75 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
