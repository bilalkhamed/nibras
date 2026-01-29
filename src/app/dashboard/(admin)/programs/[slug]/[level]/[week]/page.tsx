import { CustomToaster } from '@/components/common/custom-toaster';
import { notFound } from 'next/navigation';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getWeekAssignments } from '@/features/assignments/service';
import {
  CreateAssignmentSheet,
  AssignmentsTableWithActions,
} from '@/features/assignments/components';
import { getLevelBySlug, getWeekByNumber } from '@/features/programs/service';
import { CustomAlert } from '@/components/common/custom-alert';

export default async function ProgramWeekPage({
  params,
}: {
  params: Promise<{ slug: string; level: string; week: string }>;
}) {
  const { level, slug, week } = await params;

  //TODO get Week instead of CalendarWeek
  const weekResult = await getWeekByNumber(Number(week.replace('week-', '')));

  if (!weekResult.success) {
    if (weekResult.error.type === 'not-found') {
      notFound();
    }
    return (
      <CustomAlert
        variant="destructive"
        title="عذراً، حدث خطأ ما."
        description={`فشل في جلب بيانات الأسبوع من الخادم. رمز الخطا: ${weekResult.error.statusCode}`}
      />
    );
  }

  const weekData = weekResult.data;

  if (!weekData) {
    notFound();
  }

  const levelResult = await getLevelBySlug(level);

  if (!levelResult.success) {
    notFound();
  }

  const levelData = levelResult.data;

  if (!levelData) {
    notFound();
  }

  const assignmentsResult = await getWeekAssignments({
    levelId: levelData.id,
    weekId: weekData.id,
    programSlug: slug,
    withAttachments: true,
  });

  // Handle service errors
  if (!assignmentsResult.success) {
    notFound();
  }

  const assignmentsWithUrls = await Promise.all(
    assignmentsResult.data.map(async (assignment) => {
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
            {weekData.title}
          </h3>
          <CreateAssignmentSheet
            levelSlug={level}
            weekId={weekData.id}
            programSlug={slug}
          />
        </div>
        <AssignmentsTableWithActions assignments={assignmentsWithUrls} />
      </div>
      <CustomToaster />
    </>
  );
}
