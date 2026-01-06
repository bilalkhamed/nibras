import prisma from '@/lib/server/prisma';
import { AddAssignmentSheet } from './add-assignment-dialog';
import { CustomToaster } from '@/components/common/custom-toaster';
import { notFound } from 'next/navigation';
import { AssignmentsTableWithActions } from './assignments-table-with-actions';

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
    include: {
      attachments: true,
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
          <AddAssignmentSheet
            levelSlug={level}
            weekId={weekData.id}
            programSlug={slug}
          />
        </div>
        <AssignmentsTableWithActions assignments={assignments} />
      </div>
      <CustomToaster />
    </>
  );
}
