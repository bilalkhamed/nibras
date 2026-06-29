import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Video, Award, Heart } from 'lucide-react';
import { toArabicNumerals } from '@/lib/shared/utils';
import type { StudentAchievementsData } from '@/features/assignments/types';

interface StudentAchievementsProps {
  data: StudentAchievementsData;
}

export function StudentAchievements({ data }: StudentAchievementsProps) {
  const { counts, programNames, completedCount, totalCount, levelTitle } = data;

  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Section Title ─────────────────────────────────────────────── */}
      <h2 className="text-xl font-bold tracking-tight">إنجازاتي وتقدمي</h2>

      {/* ── Achievements Stat Cards ───────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* Card 1: Books read */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium">
                عدد الكتب المقروءة
              </p>
              <p className="text-xl font-bold tabular-nums">
                {toArabicNumerals(counts.reading === 0 ? '-' : counts.reading)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lectures of Reading Program */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium">
                محاضرات {programNames.reading}
              </p>
              <p className="text-xl font-bold tabular-nums">
                {toArabicNumerals(counts.lectureReading === 0 ? '-' : counts.lectureReading)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Lectures of Heart Program */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
              <Heart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium">
                محاضرات {programNames.heart}
              </p>
              <p className="text-xl font-bold tabular-nums">
                {toArabicNumerals(counts.lectureHeart === 0 ? '-' : counts.lectureHeart)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Exercises */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium">
                عدد التمارين
              </p>
              <p className="text-xl font-bold tabular-nums">
                {toArabicNumerals(
                  counts.exercise === 0 ? '-' : counts.exercise,
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Progress Bar Card ─────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">
                  {levelTitle || 'المستوى الحالي'}
                </p>
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-secondary tabular-nums">
                  {toArabicNumerals(progressPercentage)}٪
                </span>
              </div>
            </div>

            {/* Outer Progress Bar container: original color empty (bg-transparent) with a border */}
            <div className="h-3 w-full bg-transparent border border-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground text-start">
              أنجزت {toArabicNumerals(completedCount)} مهمة من أصل{' '}
              {toArabicNumerals(totalCount)} للمستوى الحالي.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
