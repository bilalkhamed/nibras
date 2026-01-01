import { getCurrentWeek } from '@/lib/server/current-week';
import type { getGroupById } from '@/lib/server/groups';

type Props = {
  group: NonNullable<Awaited<ReturnType<typeof getGroupById>>>;
  currentWeek: NonNullable<Awaited<ReturnType<typeof getCurrentWeek>>>;
};

export function GroupInfoSection({ group, currentWeek }: Props) {
  const { cohort } = group;
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    });

  return (
    <section className="rounded-2xl border border-primary/15 bg-card p-6 shadow-sm dark:border-primary/25 dark:bg-[#15101f]">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <span className="text-2xl">📚</span>
        معلومات المجموعة
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Cohort Name */}
        <div className="rounded-xl border border-primary/10 bg-primary-soft/50 p-4 dark:border-primary/30 dark:bg-[#2a2035]/80">
          <p className="text-xs font-semibold text-primary dark:text-primary/90">
            الدفعة
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {cohort.name}
          </p>
        </div>

        {/* Group Code */}
        <div className="rounded-xl border border-primary/10 bg-primary-soft/50 p-4 dark:border-primary/30 dark:bg-[#2a2035]/80">
          <p className="text-xs font-semibold text-primary dark:text-primary/90">
            تاريخ الإنشاء
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {group.createdAt.toLocaleDateString('ar-SA')}
          </p>
        </div>

        {/* Current Level */}
        {cohort.currentLevel && (
          <div className="rounded-xl border border-secondary/10 bg-secondary-soft/50 p-4 dark:border-secondary/30 dark:bg-[#1b1524]/80">
            <p className="text-xs font-semibold text-secondary dark:text-secondary/90">
              المستوى الحالي
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {cohort.currentLevel.title}
            </p>
          </div>
        )}

        {/* Duration */}
        <div className="rounded-xl border border-accent/10 bg-accent-soft/50 p-4 dark:border-accent/30 dark:bg-[#1f172b]/80">
          <p className="text-xs font-semibold text-accent dark:text-accent/90">
            الأسبوع الحالي
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {currentWeek.week.title} -{' '}
            {currentWeek.startDate.toLocaleDateString('ar-SA')} إلى{' '}
            {currentWeek.endDate.toLocaleDateString('ar-SA')}
          </p>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary-soft/30 to-secondary-soft/30 p-4 text-center dark:from-[#2a2035]/50 dark:to-[#1b1524]/50">
        <p className="text-sm font-semibold text-foreground">
          🌟 أنتِ جزء من فريق رائع! استمري في التألق 🌟
        </p>
      </div>
    </section>
  );
}
