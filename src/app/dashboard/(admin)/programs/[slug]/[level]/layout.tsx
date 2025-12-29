import prisma from '@/lib/server/prisma';
import { notFound } from 'next/navigation';
import { WeekNavigator } from './week-navigator';

export default async function ProgramLevelPage({
  params,
  children,
}: {
  params: Promise<{ slug: string; level: string }>;
  children: React.ReactNode;
}) {
  const { level } = await params;

  const levelData = await prisma.level.findUnique({
    where: { slug: level },
  });

  if (!levelData) {
    notFound();
  }

  const weeks = await prisma.week.findMany({
    select: { id: true, number: true, title: true },
  });

  return (
    <div className="space-y-6">
      <WeekNavigator weeks={weeks} />
      {children}
    </div>
  );
}
