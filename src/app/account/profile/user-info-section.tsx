import {
  User as UserIcon,
  IdCard,
  XIcon,
  MailIcon,
  GlobeIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoField } from '@/components/info-field';
import { formatRole } from '@/lib/utils';
import { getCurrentUser } from '@/lib/current-user';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import labels from '@/lib/labels.json';

export default async function UserInfoSection() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <XIcon className="h-5 w-5 text-destructive" />
        <AlertTitle>خطأ في التحميل</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل معلومات المستخدم. يرجى تسجيل الدخول مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`;

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        معلومات الحساب
      </h2>
      <Card className="border-border bg-card/80">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="الاسم الكامل"
              value={fullName}
              icon={<UserIcon className="h-4 w-4" />}
            />
            <InfoField
              label="البريد الإلكتروني"
              value={user.email}
              icon={<MailIcon className="h-4 w-4" />}
            />
            <InfoField
              label="الدور"
              value={formatRole(user.role)}
              icon={<ShieldCheckIcon className="h-4 w-4" />}
            />
            <InfoField
              label="سنة الميلاد"
              value={String(user.birthYear)}
              icon={<CalendarDaysIcon className="h-4 w-4" />}
            />
            <InfoField
              label="الدولة"
              value={user.country || labels.common.null}
              icon={<GlobeIcon className="h-4 w-4" />}
            />
            <InfoField
              label="المعرف"
              value={user.id}
              icon={<IdCard className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
