import { getCurrentWeek } from '@/lib/server/weeks';
import type { GroupDetailDTO } from '@/features/groups';

type Props = {
  group: GroupDetailDTO;
  currentWeek: NonNullable<Awaited<ReturnType<typeof getCurrentWeek>>>;
};

export function GroupInfoSection({ group, currentWeek }: Props) {
  const { cohort } = group;

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
      <div className="mt-4 rounded-xl border border-primary/20 bg-linear-to-r from-primary-soft/30 to-secondary-soft/30 p-4 text-center dark:from-[#2a2035]/50 dark:to-[#1b1524]/50">
        <p className="text-sm font-semibold text-foreground">
          {getRandomMotivationalMessage()}
        </p>
      </div>
    </section>
  );
}

const motivationalMessages = [
  '🌟 أنتِ جزء من فريق رائع! استمري في التألق 🌟',
  '🚀 معاً نحو آفاق جديدة من التعلم والنجاح! 🚀',
  '🎯 كل يوم هو فرصة جديدة للتقدم! لننطلق معاً! 🎯',
  '💡 التعلم رحلة مستمرة، وأنتِ في مقدمتها! 💡',
  '📚 معاً نبني مستقبل مشرق بالعلم والمعرفة! 📚',
  '🔥 لا شيء يمكن أن يوقفكِ عندما تكونين مصممة على النجاح! 🔥',
  '🌈 كل تحدي هو فرصة جديدة للتألق! لنواجهها معاً! 🌈',
  '💪 قوتنا في تعاوننا! معاً نحقق المستحيل! 💪',
  '✨ استمري في السعي نحو التميز، فأنتِ قادرة على ذلك! ✨',
  '🎉 كل إنجاز صغير يقربنا من هدفنا الكبير! لنحتفل معاً! 🎉',
  '🌻 ازرعي بذور المعرفة، واحصدي ثمار النجاح! 🌻',
  '🚴‍♀️ معاً نقطع مسافات طويلة في رحلة التعلم! 🚴‍♀️',
  '🌟 أنتِ نجم في سماء التعلم! استمري في التألق! 🌟',
];

function getRandomMotivationalMessage() {
  const index = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[index];
}
