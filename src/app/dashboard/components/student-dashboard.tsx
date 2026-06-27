import { CheckCircle2, BookOpen, Star, Trophy, ArrowLeft } from 'lucide-react';
import { getStudentBasicInfo } from '@/features/users/service';
import {
  getStudentDashboardData,
  getStudentAchievements,
} from '@/features/assignments/service';
import { StudentAchievements } from '@/features/assignments/components/student/student-achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toArabicNumerals } from '@/lib/shared/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'مساء الخير';
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'مساء الخير';
}

function fmtNum(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function fmtDate(date: Date) {
  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

/** Converts a western numeral to an Eastern Arabic numeral string */

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export async function StudentDashboard() {
  const [studentResult, dashboardResult, achievementsResult] =
    await Promise.all([
      getStudentBasicInfo(),
      getStudentDashboardData(),
      getStudentAchievements(),
    ]);

  if (!dashboardResult.success) return null;

  const student = studentResult.success ? studentResult.data : null;
  const data = dashboardResult.data;
  const greeting = getGreeting();

  const weekLabel = data.currentWeek
    ? `الأسبوع ${data.currentWeek.number}`
    : 'الأسبوع الحالي';
  const weekDateRange = data.currentWeek
    ? `${fmtDate(data.currentWeek.startDate)} – ${fmtDate(data.currentWeek.endDate)}`
    : '';

  return (
    <div className="space-y-6">
      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold">
          {greeting}، {student?.firstName}! 👋
        </h1>
      </div>

      {/* ── Two-column main content ───────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-stretch">
        {/* Right (wider) — pending this week */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <BookOpen className="h-5 w-5 text-blue-500" />
                مهام هذا الأسبوع
              </CardTitle>
              <div className="text-end">
                <p className="text-sm font-medium">
                  {toArabicNumerals(weekLabel)}
                </p>
                {weekDateRange && (
                  <p className="text-muted-foreground text-xs">
                    {weekDateRange}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {data.pendingThisWeek.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="font-medium">أنجزت كل مهام الأسبوع 🎉</p>
                <p className="text-muted-foreground text-sm">
                  عمل رائع، استمري!
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {(() => {
                  // Group by programName preserving insertion order
                  const grouped = data.pendingThisWeek.reduce<
                    Record<string, typeof data.pendingThisWeek>
                  >((acc, item) => {
                    (acc[item.programName] ??= []).push(item);
                    return acc;
                  }, {});

                  return Object.entries(grouped).map(([program, items]) => {
                    const visible = items.slice(0, 2);
                    const overflow = items.length - visible.length;
                    return (
                      <div key={program}>
                        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                          {program}
                        </p>
                        <ul className="divide-border divide-y">
                          {visible.map((item) => (
                            <li
                              key={item.assignmentId}
                              className="py-3 first:pt-0 last:pb-0"
                            >
                              <p className="min-w-0 truncate font-medium">
                                {item.name}
                              </p>
                            </li>
                          ))}
                        </ul>
                        {overflow > 0 && (
                          <p className="text-muted-foreground mt-2 text-start text-xs">
                            {overflow === 1
                              ? 'مهمة أخرى'
                              : overflow === 2
                                ? 'مهمتان أخريان'
                                : `${toArabicNumerals(overflow)} مهمات أخرى`}
                          </p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </CardContent>
          {data.currentWeek && (
            <div className="px-6 pb-4 text-left">
              <Link
                href={`/dashboard/history?week=${data.currentWeek.number}`}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                <ArrowLeft className="me-2 inline h-4 w-4" />
                عرض مهام الأسبوع
              </Link>
            </div>
          )}
        </Card>

        {/* Left (narrower) — recently completed */}
        <Card className="flex flex-col lg:w-72">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Star className="h-5 w-5 text-yellow-500" />
              آخر التقييمات
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {data.recentCompletions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                لا توجد مهام مقيمة بعد
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {data.recentCompletions.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      {item.completedAt && (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {new Date(item.completedAt).toLocaleString('ar-SA', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    {item.score != null && item.maxScore != null && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 font-mono text-white"
                      >
                        {toArabicNumerals(fmtNum(item.score))} /{' '}
                        {toArabicNumerals(fmtNum(item.maxScore))}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom stat row ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Weekly score */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">درجة الأسبوع</p>
              <p className="text-xl font-bold tabular-nums">
                {toArabicNumerals(fmtNum(data.weekEarnedScore))}{' '}
                <span className="text-muted-foreground text-sm font-normal">
                  / {toArabicNumerals(fmtNum(data.weekMaxScore))}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total score */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">الدرجة الكلية</p>
              <p className="text-xl font-bold tabular-nums">
                {toArabicNumerals(fmtNum(data.totalEarnedScore))}{' '}
                <span className="text-muted-foreground text-sm font-normal">
                  / {toArabicNumerals(fmtNum(data.totalMaxScore))}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Achievements and Cohort Progress ──────────────────────────── */}
      {achievementsResult.success && (
        <StudentAchievements data={achievementsResult.data} />
      )}
    </div>
  );
}
