import { MapPinIcon, GraduationCapIcon, PhoneIcon, UserIcon, XIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoField } from '@/components/common/info-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import labels from '@/lib/labels.json';
import { getCurrentUser } from '@/lib/server/current-user';

export default async function StudentProfileSection() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <XIcon className="h-5 w-5 text-destructive" />
        <AlertTitle>خطأ في التحميل</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل معلومات الملف الشخصي للطالب. يرجى تسجيل الدخول مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  const profile = user.studentProfile;

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        الملف الشخصي للطالب
      </h2>
      <Card className="border-border bg-card/80">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="المرحلة الدراسية"
              value={
                (profile?.gradeLevel &&
                  labels.gradeLevels[
                    profile.gradeLevel as keyof typeof labels.gradeLevels
                  ]) ||
                'غير محدد'
              }
              icon={<GraduationCapIcon className="h-4 w-4" />}
            />
            <InfoField
              label="العنوان"
              value={profile?.address || 'غير محدد'}
              icon={<MapPinIcon className="h-4 w-4" />}
            />
            <InfoField
              label="اسم الأم"
              value={profile?.motherFullName || 'غير محدد'}
              icon={<UserIcon className="h-4 w-4" />}
            />
            <InfoField
              label="رقم هاتف الأم"
              value={profile?.motherPhone || 'غير محدد'}
              icon={<PhoneIcon className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
