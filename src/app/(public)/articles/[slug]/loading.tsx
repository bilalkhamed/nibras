import { ArrowLeft } from 'lucide-react';

export default function ArticleLoading() {
  return (
    <article className="min-h-screen animate-pulse bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
          <div className="h-9 w-24 rounded-full bg-muted" />
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <header className="relative">
        {/* Cover Image Skeleton */}
        <div className="aspect-[21/9] w-full bg-muted" />

        {/* Title Card Skeleton */}
        <div className="container relative mx-auto px-4">
          <div className="-mt-32 rounded-2xl border border-border bg-card p-6 shadow-2xl md:-mt-48 md:p-10 lg:p-12">
            {/* Category */}
            <div className="mb-4 h-6 w-20 rounded-full bg-muted" />

            {/* Title */}
            <div className="space-y-3">
              <div className="h-10 w-4/5 rounded bg-muted" />
              <div className="h-10 w-2/3 rounded bg-muted" />
            </div>

            {/* Meta Info */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-6 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="size-10 rounded-full bg-muted" />
                  <div className="space-y-1">
                    <div className="h-3 w-12 rounded bg-muted" />
                    <div className="h-4 w-20 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Paragraph skeletons */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-full rounded bg-muted" />
              <div className="h-5 w-full rounded bg-muted" />
              <div className="h-5 w-11/12 rounded bg-muted" />
              <div className="h-5 w-4/5 rounded bg-muted" />
              <div className="h-8" /> {/* Paragraph spacing */}
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="h-9 w-48 rounded bg-muted" />
            <div className="h-9 w-24 rounded-full bg-muted" />
          </div>
        </div>
      </footer>
    </article>
  );
}
