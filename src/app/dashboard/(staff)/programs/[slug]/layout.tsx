import { notFound } from 'next/navigation';
import { LevelTabs } from './level-tabs';
import {
  getAllLevels,
  getProgramBySlug,
} from '@/features/programs/service/queries';
import { CustomAlert } from '@/components/common/custom-alert';

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function ProgramDetailPage({
  params,
  children,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  const result = await getProgramBySlug(slug);

  if (!result.success) {
    if (result.error.type === 'not-found') {
      notFound();
    }
    return (
      <CustomAlert
        variant="destructive"
        title="خطأ"
        description={'حدث خطأ أثناء جلب البرنامج. الرجاء المحاولة مرة أخرى.'}
      />
    );
  }

  const program = result.data;

  if (!program) {
    notFound();
  }

  const levelsResult = await getAllLevels();

  if (!levelsResult.success) {
    return (
      <CustomAlert
        variant="destructive"
        title="عذرا، حدث خطأ ما."
        description={'حدث خطأ أثناء جلب المستويات. الرجاء المحاولة مرة أخرى.'}
      />
    );
  }

  const levels = levelsResult.data;
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
