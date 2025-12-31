type Props = {
  heroTitle: string;
  primaryMessage: string;
  deadlineLabel: string;
  streakText: string;
};

export function WeekHero({
  heroTitle,
  primaryMessage,
  deadlineLabel,
  streakText,
}: Props) {
  return (
    <section className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 p-6 shadow-md dark:from-primary/10 dark:via-background dark:to-secondary/10 dark:border-primary/30">
      <p className="text-sm font-semibold text-primary dark:text-secondary-foreground">
        هذا الأسبوع
      </p>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground dark:text-secondary-foreground">
            {heroTitle}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground/80">
            {primaryMessage}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 border border-secondary/30 shadow-sm dark:bg-secondary/20 dark:border-secondary/40">
            <span className="text-sm font-semibold text-secondary-foreground dark:text-secondary/90">
              📅 {deadlineLabel}
            </span>
          </div>
          <div className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold dark:bg-primary/85">
            {streakText} 🔥
          </div>
        </div>
      </div>
    </section>
  );
}
