import {
  User as UserIcon,
  IdCard,
  XIcon,
  MailIcon,
  GlobeIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  PhoneIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoField } from '@/components/common/info-field';
import { formatRole } from '@/lib/shared/utils';
import { getCurrentUser } from '@/lib/server/current-user';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import labels from '@/lib/labels.json';
import { CountryCode } from '@/types/types';
import { EditUserSheet } from '@/features/users/components/edit-user-sheet';

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
  const profile = user.studentProfile;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-foreground">
          معلومات الحساب
        </h2>
        <EditUserSheet
          userId={user.id}
          defaultUserValues={{
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email ?? undefined,
            birthYear: user.birthYear,
            country: user.country ?? '',
            phone: user.phone ?? undefined,
          }}
          defaultProfileValues={
            profile
              ? {
                  gradeLevel: profile.gradeLevel,
                  address: profile.address,
                  motherFullName: profile.motherFullName,
                  motherPhone: profile.motherPhone,
                }
              : undefined
          }
        />
      </div>
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
              value={user.email || 'غير محدد'}
              icon={<MailIcon className="h-4 w-4" />}
            />
            <InfoField
              label="رقم الهاتف"
              value={user.phone || 'غير محدد'}
              icon={<PhoneIcon className="h-4 w-4" />}
            />
            <InfoField
              label="الرتبة"
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
              value={
                (user.country &&
                  labels.countries[user.country as CountryCode]) ||
                'غير محدد'
              }
              icon={<GlobeIcon className="h-4 w-4" />}
            />
            <InfoField
              label="المعرف"
              value={user.username || user.id}
              icon={<IdCard className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
