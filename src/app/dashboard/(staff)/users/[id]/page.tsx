import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyValue } from '@/components/common/copy-value';
import { InfoField } from '@/components/common/info-field';
import {
  // Snowflake,
  // Trash2,
  // KeyRound,
  // Pencil,
  ExternalLink,
} from 'lucide-react';
import labels from '@/lib/labels.json';
import { Role, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { formatDate } from '@/lib/shared/utils';
import { runServiceOrRedirect } from '@/lib/server/service/helpers';
import { getUserById } from '@/features/users/service';
import { EditUserSheet } from '@/features/users/components';
import Link from 'next/link';
import {
  getGroups,
  GroupListItemDTO,
  GroupStudentDTO,
} from '@/features/groups';
import { getStudentAllGroups } from '@/features/groups/service/queries';
import getAuthSession from '@/lib/server/auth-session';

type UserDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const session = await getAuthSession();

  const res = await runServiceOrRedirect(() => getUserById(id));

  if (!res.success) {
    if (res.error.type === 'not-found') {
      return <UserNotFound />;
    }
    return <div>حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً.</div>;
  }

  const user = res.data;

  let studentGroups: GroupStudentDTO[] = [];

  if (user.role === STUDENT_ROLE) {
    const res = await getStudentAllGroups(user.id);
    if (res.success) {
      studentGroups = res.data;
    }
  }

  const activeGroup = studentGroups.find((g) => g.isActive);

  let supervisorGroups: GroupListItemDTO[] = [];

  if (user.role === SUPERVISOR_ROLE) {
    const res = await getGroups({
      supervisorId: user.id,
    });

    if (res.success) {
      supervisorGroups = res.data;
    }
  }

  const age = new Date().getFullYear() - user.birthYear;
  const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`;

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-3" dir="rtl">
          <h2 className="text-xl font-semibold text-foreground">
            معلومات الحساب
          </h2>
          {session?.role !== Role.director && (
            <EditUserSheet
              userId={user.id}
              defaultUserValues={{
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                email: user.email ?? undefined,
                birthYear: user.birthYear,
                country: user.country ?? '',
              }}
              defaultProfileValues={{
                gradeLevel: user.studentProfile?.gradeLevel,
                address: user.studentProfile?.address,
                motherFullName: user.studentProfile?.motherFullName,
                motherPhone: user.studentProfile?.motherPhone,
              }}
            />
          )}
        </div>
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl font-bold text-foreground">{fullName}</p>
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CopyValue
                label="البريد الإلكتروني"
                value={user.email || labels.common.null}
              />
              <CopyValue
                label="رقم الهاتف"
                value={user.phone || labels.common.null}
              />
              <InfoField
                label="الرتبة"
                value={labels.dashboard.users[user.role]}
              />
              <InfoField
                label="الحالة"
                value={labels.dashboard.users[user.status]}
              />
              <InfoField label="سنة الميلاد" value={String(user.birthYear)} />
              <InfoField label="العمر" value={`${age} سنة`} />
              <InfoField
                label="الدولة"
                value={
                  (user.country &&
                    labels.countries[
                      user.country as keyof typeof labels.countries
                    ]) ||
                  labels.common.null
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          معلومات الملف الشخصي
        </h2>
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="المرحلة الدراسية"
                value={
                  user.studentProfile?.gradeLevel
                    ? labels.gradeLevels[user.studentProfile.gradeLevel]
                    : labels.common.null
                }
              />
              {(function () {
                const country =
                  user.country &&
                  labels.countries[
                    user.country as keyof typeof labels.countries
                  ];
                return (
                  <InfoField
                    label="العنوان"
                    value={
                      user.studentProfile?.address
                        ? country
                          ? country + '، ' + user.studentProfile.address
                          : user.studentProfile.address
                        : country || '–'
                    }
                  />
                );
              })()}

              <InfoField
                label="اسم الأم"
                value={
                  user.studentProfile?.motherFullName || labels.common.null
                }
              />
              <CopyValue
                label="رقم هاتف الأم"
                value={user.studentProfile?.motherPhone || labels.common.null}
              />
            </div>
            {user.studentProfile?.skills &&
              user.studentProfile.skills.length > 0 && (
                <div>
                  <InfoField
                    label="المهارات"
                    value={user.studentProfile?.skills}
                  />
                </div>
              )}
          </CardContent>
        </Card>
      </section>

      {/* <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          إجراءات إدارية
        </h2>
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 md:p-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-border flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              <span>تعديل البيانات</span>
            </Button>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2"
            >
              <Snowflake className="h-4 w-4" />
              <span>تجميد الحساب</span>
            </Button>
            <Button
              variant="outline"
              className="border-border flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>إعادة تعيين كلمة السر</span>
            </Button>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>حذف الحساب</span>
            </Button>
          </CardContent>
        </Card>
      </section> */}

      {/* Role-specific */}
      {user.role === 'student' ? (
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              المجموعة الحالية
            </h2>
            <Card className="border-border bg-card/80">
              <CardContent className="p-4 md:p-6">
                {activeGroup ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          المجموعة
                        </p>
                        <p className="font-medium text-foreground">
                          {activeGroup.group.name}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/groups/${activeGroup.group.id}/info`}
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <InfoField
                      label="تاريخ الانضمام"
                      value={formatDate(activeGroup.joinedAt)}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-right">
                    الطالبة ليست ضمن أي مجموعة حالياً.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              سجل المجموعات
            </h2>
            <Card className="border-border bg-card/80">
              <CardContent className="p-4 md:p-6 space-y-3" dir="rtl">
                {studentGroups.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-muted/40 p-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-right">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground flex items-center">
                          {item.group.name}
                          <Link
                            href={`/dashboard/groups/${item.group.id}/info`}
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الدفعة: {item.group.cohort.name}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>الانضمام: {formatDate(item.joinedAt)}</p>
                        <p>
                          المغادرة:{' '}
                          {item.leftAt ? formatDate(item.leftAt) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              مجموعات الإشراف الحالية
            </h2>
            <Card className="border-border bg-card/80">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supervisorGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/40 p-3 shadow-sm text-right"
                    >
                      <p className="font-medium text-foreground">
                        {group.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        الدفعة: {group.cohort.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        بداية الإشراف: {formatDate(group.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              سجل الإشراف
            </h2>
            <Card className="border-border bg-card/80">
              <CardContent className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground text-right">
                  لا يوجد سجل محفوظ بعد.
                </p>
              </CardContent>
            </Card>
          </section> */}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map = {
    admin: {
      label: 'مسؤول',
      className: 'bg-primary/15 text-primary border-primary/30',
    },
    director: {
      label: 'الادارة العامة',
      className: 'bg-primary/15 text-primary border-primary/30',
    },
    supervisor: {
      label: 'مشرفة',
      className: 'bg-accent/15 text-accent-foreground border-accent/30',
    },
    student: {
      label: 'طالبة',
      className:
        'bg-secondary/20 text-secondary-foreground border-secondary/30',
    },
    cohort_manager: {
      label: 'مديرة دفعة',
      className:
        'bg-secondary/20 text-secondary-foreground border-secondary/30',
    },
    group_manager: {
      label: 'مديرة مجموعات',
      className:
        'bg-secondary/20 text-secondary-foreground border-secondary/30',
    },
    media_team: {
      label: 'فريق الاعلام',
      className:
        'bg-secondary/20 text-secondary-foreground border-secondary/30',
    },
    program_manager: {
      label: 'مديرة برنامج',
      className:
        'bg-secondary/20 text-secondary-foreground border-secondary/30',
    },
  } as const;

  const cfg = map[role];
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}

function StatusBadge({
  status,
}: {
  status: 'active' | 'suspended' | 'invited' | 'deleted';
}) {
  const map = {
    active: {
      label: 'نشطة',
      className: 'bg-success/15 text-success border-success/30',
    },
    suspended: {
      label: 'مجمّدة',
      className: 'bg-warning/15 text-warning border-warning/30',
    },
    invited: {
      label: 'مدعوة',
      className: 'bg-info/15 text-info border-info/30',
    },
    deleted: {
      label: 'محذوفة',
      className: 'bg-destructive/15 text-destructive border-destructive/30',
    },
  } as const;

  const cfg = map[status];
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}

function UserNotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold mb-4 text-destructive">
        المستخدم غير موجود
      </h2>
      <p className="text-muted-foreground mb-6">
        عذراً، لم نتمكن من العثور على هذا المستخدم.
      </p>
      <Link href="/dashboard/users">
        <Button variant="outline">العودة إلى قائمة المستخدمين</Button>
      </Link>
    </div>
  );
}
