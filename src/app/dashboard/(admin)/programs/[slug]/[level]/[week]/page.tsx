import { CustomToaster } from '@/components/common/custom-toaster';
import { notFound } from 'next/navigation';
import { AssignmentsTableWithActions } from './assignments-table-with-actions';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getWeekAssignments } from '@/features/assignments/db';
import { getLevelBySlug } from '@/lib/server/levels';
import { getWeekByNumber } from '@/lib/server/weeks';
import { CreateAssignmentSheet } from './create-assignment-sheet';

export default async function ProgramWeekPage({
  params,
}: {
  params: Promise<{ slug: string; level: string; week: string }>;
}) {
  const { level, slug, week } = await params;

  //TODO get Week instead of CalendarWeek
  const weekData = await getWeekByNumber(Number(week.replace('week-', '')));

  if (!weekData) {
    notFound();
  }

  const levelData = await getLevelBySlug(level);

  if (!levelData) {
    notFound();
  }

  const assignments = await getWeekAssignments({
    levelId: levelData.id,
    weekId: weekData.week.id,
    programSlug: slug,
    withAttachments: true,
  });

  const assignmentsWithUrls = await Promise.all(
    assignments.map(async (assignment) => {
      const attachmentsWithUrls = await Promise.all(
        assignment.attachments.map(async (att) => {
          if (att.type === 'FILE' && att.fileKey) {
            const command = new GetObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: att.fileKey,
            });
            return {
              ...att,
              tempUrl: await getSignedUrl(S3, command, { expiresIn: 3600 }),
            };
          }
          return { ...att, tempUrl: att.url! }; // Fallback for links
        }),
      );
      return { ...assignment, attachments: attachmentsWithUrls };
    }),
  );

  return (
    <>
      <div className="space-y-6 mt-10">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold text-foreground">
            {weekData?.week.title}
          </h3>
          <CreateAssignmentSheet
            levelSlug={level}
            weekId={weekData.week.id}
            programSlug={slug}
          />
        </div>
        <AssignmentsTableWithActions assignments={assignmentsWithUrls} />
      </div>
      <CustomToaster />
    </>
  );
}
