import prisma from '@/lib/server/prisma';
import { notFound } from 'next/navigation';
import { LevelTabs } from './level-tabs';

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function ProgramDetailPage({
  params,
  children,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  const program = await prisma.program.findUnique({
    where: { slug },
  });

  if (!program) {
    notFound();
  }

  const levels = await prisma.level.findMany({
    select: {
      title: true,
      slug: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {program.name}
            </h1>
            {program.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {program.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <LevelTabs programSlug={slug} levels={levels} />

      {children}
    </div>
  );
}
