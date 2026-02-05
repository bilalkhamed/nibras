import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function ArticleNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="size-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          المقال غير موجود
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-md text-muted-foreground">
          عذراً، لم نتمكن من العثور على المقال المطلوب. ربما تم حذفه أو تغيير
          رابطه.
        </p>

        {/* Back Link */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          <span>العودة لغرفة الأخبار</span>
        </Link>
      </div>
    </div>
  );
}
