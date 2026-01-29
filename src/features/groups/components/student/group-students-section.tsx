import { Sparkles, Star } from 'lucide-react';

type Student = {
  id: string;
  name: string;
  isMe: boolean;
};

type Props = {
  students: Student[];
};

export function GroupStudentsSection({ students }: Props) {
  // Generate random placeholder scores/streaks for gamification preview
  const getPlaceholderScore = (id: string) => {
    // Use id to generate consistent random number
    const num = parseInt(id.slice(-4), 16);
    const res = 50 + (num % 450); // Random between 50-500
    return Number.isNaN(res) ? 1 : res;
  };

  const getPlaceholderStreak = (id: string) => {
    const num = parseInt(id.slice(-3), 16);
    const res = 1 + (num % 20); // Random between 1-20
    return Number.isNaN(res) ? 1 : res;
  };

  return (
    <section className="rounded-2xl border border-primary/15 bg-card p-6 shadow-sm dark:border-primary/25 dark:bg-[#15101f]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">👭</span>
          زميلاتي في المجموعة
        </h2>
        <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
          {students.length} طالبة
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {students.map((student) => {
          const score = getPlaceholderScore(student.id);
          const streak = getPlaceholderStreak(student.id);

          return (
            <article
              key={student.id}
              className={`group relative rounded-xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                student.isMe
                  ? 'border-primary bg-linear-to-br from-primary-soft to-secondary-soft dark:from-[#2a2035] dark:to-[#1b1524]'
                  : 'border-primary/10 bg-card dark:bg-[#1f172b]'
              }`}
            >
              {student.isMe && (
                <div className="absolute -top-2 -right-2 rounded-full bg-linear-to-r from-primary to-secondary px-2 py-1 text-xs font-bold text-white shadow-md">
                  أنتِ ✨
                </div>
              )}

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary/80 to-secondary/80 text-xl font-bold text-white shadow-md">
                  {student.name.split(' ')[0][0]}
                </div>
              </div>

              {/* Name */}
              <p className="mt-3 text-center text-sm font-bold text-foreground line-clamp-2">
                {student.name}
              </p>

              {/* Gamification Placeholder */}
              <div className="mt-3 flex items-center justify-around gap-2 border-t border-primary/10 pt-3 dark:border-primary/20">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary dark:text-primary/90">
                    <Star className="h-3 w-3 fill-current text-primary dark:text-primary/90" />
                    <span>{score}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    نقاط
                  </span>
                </div>

                <div className="h-4 w-px bg-primary/20 dark:bg-primary/30" />

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-secondary/90">
                    <Sparkles className="h-3 w-3 text-secondary dark:text-secondary/90" />
                    <span>{streak}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    سلسلة
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 rounded-xl border border-primary/20 bg-linear-to-r from-primary-soft/20 to-secondary-soft/20 p-4 text-center dark:from-[#2a2035]/30 dark:to-[#1b1524]/30">
        <p className="text-xs text-muted-foreground">
          🎮 النقاط والسلاسل هي ميزات قادمة قريباً! استعدي للمنافسة الودية 💪
        </p>
      </div>
    </section>
  );
}
