import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, User, Newspaper } from 'lucide-react';
import {
  findManyArticles,
  findPublishedArticleBySlug,
} from '@/features/articles/dal';
import { toArabicNumerals, cn, getPublicS3Url } from '@/lib/shared/utils';
import { ShareButton } from './share-button';
import { findUserById } from '@/features/users/dal';
import { ArticleContent } from './article-content';

// ============================================================================
// Types
// ============================================================================

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate estimated reading time based on word count
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime);
}

/**
 * Format date for display
 */
function formatPublishDate(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: ar });
}

/**
 * Get public URL for cover image from public S3 bucket
 */
function getCoverImageUrl(coverImageKey: string | null): string | null {
  if (!coverImageKey) return null;
  return getPublicS3Url(coverImageKey);
}

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await findPublishedArticleBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: 'المقال غير موجود | نبراس',
    };
  }

  const article = result.data;
  const excerpt = article.content.replace(/<[^>]*>/g, '').slice(0, 160);

  return {
    title: `${article.title} | نبراس`,
    description: excerpt,
    openGraph: {
      title: article.title,
      description: excerpt,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
    },
  };
}

// ============================================================================
// Static Params (for SSG)
// ============================================================================

export async function generateStaticParams() {
  const articlesRes = await findManyArticles({
    isPublished: true,
  });

  if (!articlesRes.success) {
    return [];
  }

  const articles = articlesRes.data;

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const result = await findPublishedArticleBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const article = result.data;
  const coverUrl = getCoverImageUrl(article.coverImageKey);
  const readingTime = calculateReadingTime(article.content);

  // Get author info
  const authorResult = await findUserById(article.authorId);
  const author = authorResult.success ? authorResult.data : null;

  const authorName = author
    ? `${author.firstName} ${author.lastName}`
    : 'فريق نبراس';

  return (
    <article className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/articles"
            className={cn(
              'inline-flex items-center gap-2 text-sm font-medium text-muted-foreground',
              'transition-colors hover:text-primary',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1 -mx-2',
            )}
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            <span>العودة لغرفة الأخبار</span>
          </Link>

          <ShareButton title={article.title} />
        </div>
      </nav>

      {/* Hero Section - Redesigned for mobile visibility */}
      <header className="relative">
        {/* Cover Image - Full visibility on mobile */}
        {coverUrl ? (
          <figure className="relative w-full overflow-hidden bg-muted">
            {/* Mobile: taller aspect ratio for full image visibility */}
            {/* Desktop: wider cinematic aspect ratio */}
            <div className="relative aspect-4/3 sm:aspect-video md:aspect-21/9 ">
              <Image
                src={coverUrl}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </figure>
        ) : (
          <div className="relative flex aspect-4/3 sm:aspect-video md:aspect-21/9 w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
            <Newspaper className="size-16 sm:size-20 md:size-24 text-muted-foreground/20" />
          </div>
        )}

        {/* Title & Meta Card - Below image on mobile, overlapping on desktop */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-8 sm:-mt-16 md:-mt-24 lg:-mt-32 rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-10 lg:p-12 shadow-xl">
            {/* Category */}
            <div className="mb-3 sm:mb-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-foreground">
              {article.title}
            </h1>

            {/* Meta Info - Stack on mobile, row on desktop */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 border-t border-border pt-5 sm:pt-6 text-sm text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-primary/10">
                  <User
                    className="size-4 sm:size-5 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    الكاتب
                  </span>
                  <span className="font-medium text-foreground">
                    {authorName}
                  </span>
                </div>
              </div>

              {/* Divider - Hidden on mobile */}
              <div
                className="hidden sm:block h-8 w-px bg-border"
                aria-hidden="true"
              />

              {/* Date */}
              <div className="flex items-center gap-2">
                <div className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-secondary/10">
                  <Calendar
                    className="size-4 sm:size-5 text-secondary"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    تاريخ النشر
                  </span>
                  <time
                    dateTime={article.createdAt.toISOString()}
                    className="font-medium text-foreground"
                  >
                    {formatPublishDate(article.createdAt)}
                  </time>
                </div>
              </div>

              {/* Divider - Hidden on mobile */}
              <div
                className="hidden sm:block h-8 w-px bg-border"
                aria-hidden="true"
              />

              {/* Reading Time */}
              <div className="flex items-center gap-2">
                <div className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-accent/10">
                  <Clock
                    className="size-4 sm:size-5 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    وقت القراءة
                  </span>
                  <span className="font-medium text-foreground">
                    {toArabicNumerals(readingTime)} دقيقة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content with Reader Preferences */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <ArticleContent content={article.content} slug={slug} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
            <Link
              href="/articles"
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium text-muted-foreground',
                'transition-colors hover:text-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md px-3 py-2',
              )}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              <span>تصفح المزيد من المقالات</span>
            </Link>

            <ShareButton title={article.title} />
          </div>
        </div>
      </footer>
    </article>
  );
}
