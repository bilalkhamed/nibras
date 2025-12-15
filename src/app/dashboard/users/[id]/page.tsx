import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyValue } from '@/components/dashboard/users/copy-value';
import { InfoField } from '@/components/info-field';
import { Snowflake, Trash2, KeyRound, Pencil } from 'lucide-react';
import prisma from '@/lib/prisma';
import labels from '@/lib/labels.json';
import { Group, STUDENT_ROLE, SUPERVISOR_ROLE, User } from '@/types/types';
import { formatDate } from '@/lib/utils';
import { Prisma } from '../../../../../prisma/generated';

type UserDetailPageProps = {
  params: {
    id: string;
  };
};

type StudentGroup = Prisma.GroupStudentGetPayload<{
  include: {
    group: {
      select: {
        id: true;
        cohortId: true;
        name: true;
        supervisor: {
          select: {
            id: true;
            firstName: true;
            middleName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      hashedPassword: false,
      id: true,
      birthYear: true,
      country: true,
      createdAt: true,
      email: true,
      firstName: true,
      middleName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return notFound();
  }

  let studentGroups: StudentGroup[] = [];

  if (user.role === STUDENT_ROLE) {
    studentGroups = await prisma.groupStudent.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            cohortId: true,
            supervisor: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  const activeGroup = studentGroups.find((g) => g.isActive);

  let supervisorGroups: Group[] = [];

  if (user.role === SUPERVISOR_ROLE) {
    supervisorGroups = await prisma.group.findMany({
      where: {
        supervisorId: user.id,
      },
      select: {
        id: true,
        name: true,
        supervisorId: true,
        cohortId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  const age = new Date().getFullYear() - user.birthYear;
  const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`;
  const roleLabel = {
    admin: 'مسؤولة',
    supervisor: 'مشرفة',
    student: 'طالبة',
  } as const;
  const statusLabel = {
    active: 'نشطة',
    frozen: 'مجمّدة',
    deleted: 'محذوفة',
  } as const;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          معلومات الحساب
        </h2>
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl font-bold text-foreground">{fullName}</p>
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CopyValue label="البريد الإلكتروني" value={user.email} />
              <CopyValue
                label="رقم الهاتف"
                value={user.phone || labels.common.null}
              />
              <InfoField label="الدور" value={roleLabel[user.role]} />
              <InfoField label="الحالة" value={statusLabel[user.status]} />
              <InfoField label="سنة الميلاد" value={String(user.birthYear)} />
              <InfoField label="العمر" value={`${age} سنة`} />
              <InfoField
                label="الدولة"
                value={user.country || labels.common.null}
              />
              <InfoField
                label="تاريخ الإنشاء"
                value={formatDate(user.createdAt)}
              />
              <InfoField label="آخر تحديث" value={formatDate(user.updatedAt)} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
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
      </section>

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
                    <InfoField
                      label="اسم المجموعة"
                      value={activeGroup.group.name}
                    />
                    <InfoField
                      label="المشرفة"
                      value={
                        activeGroup.group.supervisor.firstName +
                        ' ' +
                        activeGroup.group.supervisor.middleName +
                        ' ' +
                        activeGroup.group.supervisor.lastName
                      }
                    />
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
                        <p className="font-medium text-foreground">
                          {item.group.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          المشرفة: {item.group.supervisor.firstName}{' '}
                          {item.group.supervisor.middleName}{' '}
                          {item.group.supervisor.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الدفعة: {item.group.cohortId}
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
                        الدفعة: {group.cohortId}
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

function RoleBadge({ role }: { role: 'admin' | 'supervisor' | 'student' }) {
  const map = {
    admin: {
      label: 'مسؤول',
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
  } as const;

  const cfg = map[role];
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}

function StatusBadge({ status }: { status: 'active' | 'frozen' | 'deleted' }) {
  const map = {
    active: {
      label: 'نشطة',
      className: 'bg-success/15 text-success border-success/30',
    },
    frozen: {
      label: 'مجمّدة',
      className: 'bg-warning/15 text-warning border-warning/30',
    },
    deleted: {
      label: 'محذوفة',
      className: 'bg-destructive/15 text-destructive border-destructive/30',
    },
  } as const;

  const cfg = map[status];
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}
