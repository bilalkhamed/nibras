import {
  CalendarClock,
  GraduationCap,
  Mail,
  Phone,
  User,
  UserCheck,
  Users,
  XIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InfoField } from '@/components/info-field';
import prisma from '@/lib/prisma';
import { AccessTokenPayload } from '@/types/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';

type Props = {
  auth: AccessTokenPayload;
};

export default async function GroupInfoSection({ auth }: Props) {
  const groupStudent = await prisma.groupStudent.findFirst({
    where: {
      studentId: auth.userId,
      isActive: true,
    },

    select: {
      joinedAt: true,
      group: {
        select: {
          name: true,
          cohortId: true,
          _count: {
            select: {
              students: true,
            },
          },
          supervisor: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        المجموعة والمشرفة
      </h2>
      <Card className="border-border bg-card/80">
        <CardContent className="p-4 md:p-6 space-y-6">
          {groupStudent ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="اسم المجموعة"
                  value={groupStudent.group.name}
                  icon={<Users className="h-4 w-4" />}
                />
                <InfoField
                  label="الدفعة"
                  value={groupStudent.group.cohortId}
                  icon={<GraduationCap className="h-4 w-4" />}
                />
                <InfoField
                  label="تاريخ الانضمام"
                  value={formatDate(groupStudent.joinedAt)}
                  icon={<CalendarClock className="h-4 w-4" />}
                />
                <InfoField
                  label="عدد الطالبات"
                  value={`${groupStudent.group._count.students} طالبة`}
                  icon={<UserCheck className="h-4 w-4" />}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="اسم المشرفة"
                  value={`${groupStudent.group.supervisor.firstName} ${groupStudent.group.supervisor.middleName} ${groupStudent.group.supervisor.lastName}`}
                  icon={<User className="h-4 w-4" />}
                />
                {groupStudent.group.supervisor.phone && (
                  <InfoField
                    label="رقم الجوال"
                    value={groupStudent.group.supervisor.phone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                )}
                {groupStudent.group.supervisor.email && (
                  <InfoField
                    label="البريد الإلكتروني"
                    value={groupStudent.group.supervisor.email}
                    icon={<Mail className="h-4 w-4" />}
                  />
                )}
              </div>
            </>
          ) : (
            <Alert variant="warning" className="max-w-2xl mx-auto">
              <XIcon className="h-5 w-5 text-warning" />
              <AlertTitle>لا توجد مجموعة نشطة</AlertTitle>
              <AlertDescription>
                عذرًا، لا يبدو أن لديك مجموعة نشطة في الوقت الحالي. يرجى التواصل
                مع المشرفة أو الإدارة للمزيد من المعلومات.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
