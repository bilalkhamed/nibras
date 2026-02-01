import {
  CalendarClock,
  GraduationCap,
  User,
  UserCheck,
  Users,
  XCircleIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InfoField } from '@/components/common/info-field';
import { AccessTokenPayload } from '@/types/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/lib/shared/utils';
import { getStudentActiveGroup } from '@/features/groups/service/queries';
import { CustomAlert } from '@/components/common/custom-alert';

type Props = {
  auth: AccessTokenPayload;
};

export default async function GroupInfoSection({ auth }: Props) {
  const result = await getStudentActiveGroup(auth.userId);

  if (!result.success) {
    return (
      <CustomAlert title={result?.error.type} description={result.error.type} />
    );
  }

  const groupStudent = result.data;

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
                  value={groupStudent.group.cohort.name}
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
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المشرفات ({groupStudent.group.supervisors.length})
                </h3>
                <div className="space-y-2">
                  {groupStudent.group.supervisors.map((supervisor, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm p-2 rounded-md bg-muted/30"
                    >
                      <span className="font-medium">
                        {supervisor.firstName} {supervisor.middleName}{' '}
                        {supervisor.lastName}
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs sm:text-sm">
                        {supervisor.phone && <span>{supervisor.phone}</span>}
                        {supervisor.email && <span>{supervisor.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Alert variant="warning" className="max-w-2xl mx-auto">
              <XCircleIcon className="h-5 w-5 text-warning" />
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
