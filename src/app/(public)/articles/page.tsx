import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, User, Newspaper } from 'lucide-react';
import { findPublishedArticles } from '@/features/articles/dal';
import { PublicArticleListDTO } from '@/features/articles/types';
import { toArabicNumerals, cn, getPublicS3Url } from '@/lib/shared/utils';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'غرفة الأخبار | نبراس',
  description: 'آخر الأخبار والمقالات والتحديثات من برنامج نبراس التعليمي',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate estimated reading time based on word count
 * Average Arabic reading speed: ~200 words per minute
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Format date for display with Arabic locale
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

/**
 * Truncate text to a maximum length
 */
function truncateText(text: string, maxLength: number): string {
  // Strip HTML tags for excerpt
  const plainText = text.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
}

// ============================================================================
// Components
// ============================================================================

interface ArticleCardProps {
  article: PublicArticleListDTO;
  coverUrl: string | null;
  readingTime: number;
  isHero?: boolean;
}

function ArticleCard({
  article,
  coverUrl,
  readingTime,
  isHero = false,
}: ArticleCardProps) {
  const authorName = `${article.author.firstName} ${article.author.lastName}`;
  const excerpt = truncateText(article.content, isHero ? 200 : 120);

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300',
        'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
        'motion-reduce:transition-none',
        isHero && 'md:flex-row md:items-stretch',
      )}
    >
      {/* Cover Image */}
      {coverUrl ? (
        <figure
          className={cn(
            'relative overflow-hidden bg-muted',
            isHero ? 'aspect-video md:aspect-auto md:w-1/2' : 'aspect-video',
          )}
        >
          <Image
            src={coverUrl}
            alt=""
            loading="eager"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
            sizes={
              isHero
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 768px) 100vw, 33vw'
            }
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </figure>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10',
            isHero ? 'aspect-video md:aspect-auto md:w-1/2' : 'aspect-video',
          )}
        >
          <Newspaper className="size-16 text-muted-foreground/30" />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'flex flex-1 flex-col p-6',
          isHero && 'md:justify-center md:p-8',
        )}
      >
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <header>
          <h2
            className={cn(
              'font-bold leading-tight text-foreground transition-colors group-hover:text-primary',
              isHero
                ? 'text-2xl md:text-3xl lg:text-4xl'
                : 'text-lg md:text-xl',
            )}
          >
            <Link
              href={`/articles/${article.slug}`}
              className="after:absolute after:inset-0 focus:outline-none"
              aria-label={`اقرأ المقال كاملاً: ${article.title}`}
            >
              {article.title}
            </Link>
          </h2>
        </header>

        {/* Excerpt */}
        <p
          className={cn(
            'mt-3 text-muted-foreground line-clamp-3',
            isHero ? 'text-base md:text-lg' : 'text-sm',
          )}
        >
          {excerpt}
        </p>

        {/* Meta Info */}
        <footer className="mt-auto flex flex-wrap items-center gap-4 pt-4 text-xs text-muted-foreground">
          {/* Author */}
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" aria-hidden="true" />
            <span>{authorName}</span>
          </span>

          {/* Date */}
          <time
            dateTime={article.createdAt.toISOString()}
            className="flex items-center gap-1.5"
          >
            <Calendar className="size-3.5" aria-hidden="true" />
            <span>{formatPublishDate(article.createdAt)}</span>
          </time>

          {/* Reading Time */}
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>{toArabicNumerals(readingTime)} دقيقة قراءة</span>
          </span>
        </footer>
      </div>
    </article>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <Newspaper className="size-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        لا توجد مقالات بعد
      </h2>
      <p className="max-w-md text-muted-foreground">
        ترقبي قريباً آخر الأخبار والمقالات من فريق نبراس
      </p>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ArticlesPage() {
  const result = await findPublishedArticles();

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState />
      </div>
    );
  }

  const articles = result.data;

  // Prepare articles with cover URLs and reading times
  const articlesWithMeta = articles.map((article) => ({
    article,
    coverUrl: getCoverImageUrl(article.coverImageKey),
    readingTime: calculateReadingTime(article.content),
  }));

  const [featured, ...rest] = articlesWithMeta;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm bg-image bg-[url('/articles-header-bg.png')] bg-cover bg-center">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Back Link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1 -mx-2"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary-muted shadow-lg">
              <Newspaper className="size-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                غرفة الأخبار
              </h1>
              <p className="mt-1 text-muted-foreground">
                آخر الأخبار والمقالات من برنامج نبراس
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Featured Article (Hero) */}
        {featured && (
          <section aria-labelledby="featured-heading" className="mb-12">
            <h2 id="featured-heading" className="sr-only">
              المقال المميز
            </h2>
            <ArticleCard
              article={featured.article}
              coverUrl={featured.coverUrl}
              readingTime={featured.readingTime}
              isHero
            />
          </section>
        )}

        {/* Recent Articles Grid */}
        {rest.length > 0 && (
          <section aria-labelledby="recent-heading">
            <h2
              id="recent-heading"
              className="mb-6 flex items-center gap-3 text-xl font-bold text-foreground md:text-2xl"
            >
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              <span>آخر المقالات</span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map(({ article, coverUrl, readingTime }) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  coverUrl={coverUrl}
                  readingTime={readingTime}
                />
              ))}
            </div>
          </section>
        )}

        {/* Articles Count */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          عرض {toArabicNumerals(articles.length)}{' '}
          {articles.length === 1 ? 'مقال' : 'مقالات'}
        </div>
      </main>
    </div>
  );
}
