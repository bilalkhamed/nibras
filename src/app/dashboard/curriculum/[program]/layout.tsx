import { Separator } from '@/components/ui/separator';
import { CurriculumTable } from '../components/curriculum-table';
import { LevelTabs } from '../components/level-tabs';
import { WeekNavigator } from '../components/week-navigator';
import { AddItemDialog } from '../add-item-dialogue';

export default async function ProgramLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ program: string }>;
}) {
  const { program } = await params;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 d-flex flex-col gap-3 pt-3">
      <div className="rounded-xl border border-border bg-card/60 px-4 py-4 backdrop-blur-sm space-y-4">
        {/* Levels + week + add button */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3 md:justify-between">
          <LevelTabs activeIndex={0} />

          <Separator className="md:hidden" />

          <div className="flex items-center gap-3">
            <WeekNavigator week={1} />
            <AddItemDialog program={program} level={0} week={1} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
