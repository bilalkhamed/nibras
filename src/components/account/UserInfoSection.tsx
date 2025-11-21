import { User as UserIcon, IdCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoField } from './InfoField';
import type { User } from '@/types/types';
import { formatRole } from '@/lib/utils';

type Props = {
  user: User;
};

export function UserInfoSection({ user }: Props) {
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
            <InfoField label="البريد الإلكتروني" value={user.email} />
            <InfoField label="الدور" value={formatRole(user.role)} />
            <InfoField label="سنة الميلاد" value={String(user.birthYear)} />
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
