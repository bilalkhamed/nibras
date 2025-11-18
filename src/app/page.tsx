import Link from 'next/link';
import { BookOpen, Video, Heart, Sparkles } from 'lucide-react';
import labels from '@/lib/labels.json';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary/10 to-secondary/20 px-5 py-2.5 text-primary border border-border">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">
              {labels.common.platformName}
            </span>
          </div>

          <h2 className="mb-6 text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="inline-block bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-[1.2] pt-1">
              {labels.home.heroTitle}
            </span>
          </h2>

          <p className="mx-auto mb-3 max-w-2xl text-xl leading-8 text-muted-foreground">
            {labels.home.heroDescription}
          </p>
          <p className="mb-12 text-lg text-secondary font-medium">
            {labels.home.heroSubtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant={'hook'} className="w-45 h-15 text-base group">
              <Link href="/login" className="flex flex-start items-center">
                <span>{labels.common.startNow}</span>
                <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-20 duration-300 transition-transform" />
              </Link>
            </Button>
            <Button
              variant={'outlinePrimary'}
              className="w-45 h-15 text-base font-semibold outline-primary"
            >
              <Link
                href="#programs"
                className="w-full h-full flex items-center justify-center"
              >
                {labels.common.learnMore}
              </Link>
            </Button>
          </div>
        </div>

        {/* Programs Section */}
        <div id="programs" className="mt-24 pt-3">
          <h3 className="mb-4 text-center text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            {labels.home.programsTitle}
          </h3>
          <div className="mb-12 text-center">
            <div className="inline-block h-1 w-24 bg-linear-to-r from-primary via-secondary to-accent rounded-full"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Reading Program */}
            <div className="group relative overflow-hidden rounded-3xl bg-card p-8 shadow-md transition-all hover:shadow-2xl hover:-translate-y-2 border border-border">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-blue-600"></div>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8" />
              </div>
              <h4 className="mb-3 text-2xl font-bold text-foreground">
                {labels.programs.reading.title}
              </h4>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                {labels.programs.reading.description}
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {labels.programs.reading.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-primary text-lg">✦</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lecture Program */}
            <div className="group relative overflow-hidden rounded-3xl bg-card p-8 shadow-md transition-all hover:shadow-2xl hover:-translate-y-2 border border-border">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-400 to-purple-600"></div>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Video className="h-8 w-8" />
              </div>
              <h4 className="mb-3 text-2xl font-bold text-foreground">
                {labels.programs.lecture.title}
              </h4>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                {labels.programs.lecture.description}
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {labels.programs.lecture.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-2 items-center">
                    <span className="text-primary text-lg">✦</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Heart Reassurance Program */}
            <div className="group relative overflow-hidden rounded-3xl bg-card p-8 shadow-md transition-all hover:shadow-2xl hover:-translate-y-2 border border-border">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-pink-400 to-rose-500"></div>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8" />
              </div>
              <h4 className="mb-3 text-2xl font-bold text-foreground">
                {labels.programs.heart.title}
              </h4>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                {labels.programs.heart.description}
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {labels.programs.heart.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-primary text-lg">✦</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 rounded-3xl bg-card p-12 shadow-xl border border-border">
          <h3 className="mb-4 text-center text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            {labels.home.featuresTitle}
          </h3>
          <div className="mb-12 text-center">
            <div className="inline-block h-1 w-24 bg-linear-to-r from-primary via-secondary to-accent rounded-full"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center group cursor-pointer">
              <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">
                📚
              </div>
              <h5 className="mb-2 font-semibold text-foreground">
                {labels.features.comprehensive.title}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {labels.features.comprehensive.description}
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <h5 className="mb-2 font-semibold text-foreground">
                {labels.features.interactive.title}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {labels.features.interactive.description}
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <h5 className="mb-2 font-semibold text-foreground">
                {labels.features.supervision.title}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {labels.features.supervision.description}
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">
                📊
              </div>
              <h5 className="mb-2 font-semibold text-foreground">
                {labels.features.reports.title}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {labels.features.reports.description}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
