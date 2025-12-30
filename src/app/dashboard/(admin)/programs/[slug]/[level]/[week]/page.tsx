import prisma from '@/lib/server/prisma';
import { AssignmentsTable } from '@/app/dashboard/components/assignments-table';
import { AddAssignmentDialog } from './add-assignment-dialog';
import { CustomToaster } from '@/components/common/custom-toaster';
import { notFound } from 'next/navigation';

export default async function ProgramWeekPage({
  params,
}: {
  params: Promise<{ slug: string; level: string; week: string }>;
}) {
  const { level, slug, week } = await params;

  const assignments = await prisma.assignment.findMany({
    where: {
      level: { slug: level },
      week: { number: Number(week.replace('week-', '')) },
      program: { slug },
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      url: true,
    },
  });

  const weekData = await prisma.week.findUnique({
    where: { number: Number(week.replace('week-', '')) },
  });

  if (!weekData) {
    notFound();
  }
  return (
    <>
      <div className="space-y-6 mt-10">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold text-foreground">
            {weekData?.title}
          </h3>
          <AddAssignmentDialog
            levelSlug={level}
            weekId={weekData.id}
            programSlug={slug}
          />
        </div>
        <AssignmentsTable assignments={assignments} />
      </div>
      <CustomToaster />
    </>
  );
}
