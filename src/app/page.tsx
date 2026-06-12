import { BookOpen, Video, Heart } from 'lucide-react';
import labels from '@/lib/labels.json';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { toArabicNumerals } from '@/lib/shared/utils';

export default function Home() {
  const about = labels.aboutNibras;
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-right max-w-4xl">
          <Image
            src={'/logo.svg'}
            alt={toArabicNumerals('نبراس')}
            width={220}
            height={150}
            className="mb-8 mr-0 ml-auto md:ml-0"
          />
          <h1 className="mb-5 text-6xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.15]">
            {toArabicNumerals(labels.home.heroTitle)}
          </h1>
          <p className="mb-6 text-lg leading-loose text-muted-foreground max-w-xl">
            {toArabicNumerals(about.summary)}
          </p>
          <span className="inline-block text-sm font-semibold text-secondary px-3 py-1 mb-10">
            {toArabicNumerals(labels.home.heroSubtitle)}
          </span>
        </div>

        {/* Pillars Section */}
        <div id="programs" className="mt-40">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {toArabicNumerals(labels.home.programsTitle)}
            </h2>
            <div className="h-1 w-12 bg-primary"></div>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {/* Reading Program */}
            <div className="group flex flex-col p-8 rounded-xl border border-border bg-card hover:border-primary transition-colors">
              <div className="mb-6 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                {toArabicNumerals(about.pillars.reading.title)}
              </h3>
              <p className="mb-8 text-muted-foreground leading-relaxed grow">
                {toArabicNumerals(about.pillars.reading.description)}
              </p>
              <ul className="space-y-3 border-t border-border/50 pt-6">
                {about.pillars.reading.details.map(
                  (detail: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="text-primary font-bold mt-0.5">
                        {toArabicNumerals('/')}
                      </span>
                      <span>{toArabicNumerals(detail)}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Educational Program */}
            <div className="group flex flex-col p-8 rounded-xl border border-border bg-card hover:border-accent transition-colors">
              <div className="mb-6 text-accent">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                {toArabicNumerals(about.pillars.educational.title)}
              </h3>
              <p className="mb-8 text-muted-foreground leading-relaxed grow">
                {toArabicNumerals(about.pillars.educational.description)}
              </p>
              <ul className="space-y-3 border-t border-border/50 pt-6">
                {about.pillars.educational.details.map(
                  (detail: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="text-accent font-bold mt-0.5">
                        {toArabicNumerals('/')}
                      </span>
                      <span>{toArabicNumerals(detail)}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Training Program */}
            <div className="group flex flex-col p-8 rounded-xl border border-border bg-card hover:border-secondary transition-colors">
              <div className="mb-6 text-secondary">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                {toArabicNumerals(about.pillars.training.title)}
              </h3>
              <p className="mb-8 text-muted-foreground leading-relaxed grow">
                {toArabicNumerals(about.pillars.training.description)}
              </p>
              <ul className="space-y-3 border-t border-border/50 pt-6">
                {about.pillars.training.details.map(
                  (detail: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="text-secondary font-bold mt-0.5">
                        {toArabicNumerals('/')}
                      </span>
                      <span>{toArabicNumerals(detail)}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-40">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-12">
              {toArabicNumerals(labels.home.conditionsTitle)}
            </h2>
            <ul className="space-y-6">
              {about.conditions.map((condition: string, idx: number) => (
                <li
                  key={idx}
                  className="text-xl text-muted-foreground leading-relaxed flex gap-4 items-start"
                >
                  <span className="text-primary font-bold opacity-30 shrink-0">
                    {toArabicNumerals(String(idx + 1) + '.')}
                  </span>
                  <span>{toArabicNumerals(condition)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Supervisor Section */}
        <div className="mt-50 m text-center max-w-4xl mx-auto">
          <div className=" text-accent text-s font-bold mb-8">
            {toArabicNumerals(labels.home.supervisorTitle)}
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6">
            {toArabicNumerals(about.supervisor.name)}
          </h2>
          <p className="text-2xl text-muted-foreground leading-relaxed opacity-80 mb-12">
            {toArabicNumerals(about.supervisor.bio)}
          </p>

          <div className="text-right space-y-12 border-t border-border pt-12">
            <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto text-center">
              {toArabicNumerals(about.supervisor.longBio)}
            </p>

            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-secondary mb-8 text-center">
                {toArabicNumerals(about.supervisor.activitiesTitle)}
              </h3>
              <ul className="space-y-4">
                {about.supervisor.activities.map(
                  (activity: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-muted-foreground group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-lg">
                        {toArabicNumerals(activity)}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
