import { Newspaper } from 'lucide-react';

function ArticleCardSkeleton({ isHero = false }: { isHero?: boolean }) {
  return (
    <div
      className={`animate-pulse overflow-hidden rounded-2xl border border-border bg-card ${
        isHero ? 'md:flex md:flex-row' : ''
      }`}
    >
      {/* Image Skeleton */}
      <div
        className={`bg-muted ${
          isHero ? 'aspect-video md:aspect-auto md:w-1/2' : 'aspect-video'
        }`}
      />

      {/* Content Skeleton */}
      <div
        className={`flex flex-1 flex-col p-6 ${isHero ? 'md:justify-center md:p-8' : ''}`}
      >
        {/* Category */}
        <div className="mb-3 h-6 w-16 rounded-full bg-muted" />

        {/* Title */}
        <div className={`space-y-2 ${isHero ? 'mb-4' : 'mb-3'}`}>
          <div
            className={`h-6 rounded bg-muted ${isHero ? 'w-3/4' : 'w-full'}`}
          />
          {isHero && <div className="h-6 w-1/2 rounded bg-muted" />}
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          {isHero && <div className="h-4 w-4/6 rounded bg-muted" />}
        </div>

        {/* Meta */}
        <div className="mt-auto flex gap-4 pt-4">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Back Link */}
          <div className="mb-6 h-6 w-32 rounded bg-muted" />

          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-muted shadow-lg">
              <Newspaper className="size-7 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <div className="h-10 w-48 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Featured Article Skeleton */}
        <section className="mb-12">
          <ArticleCardSkeleton isHero />
        </section>

        {/* Section Title */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <div className="h-6 w-32 rounded bg-muted" />
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
