import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InfoField } from './InfoField';

export function GroupInfoSection() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-3">
        المجموعة والمشرفة
      </h2>
      <Card className="border-border bg-card/80">
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="اسم المجموعة"
              value="زهور العلم - المجموعة 3"
              icon={<Users className="h-4 w-4" />}
            />
            <InfoField label="رمز المجموعة" value="GRP-3A2F" />
            <InfoField label="الدُفعة" value="دفعة 2025 - المستوى 2" />
            <InfoField label="عدد الطالبات" value="24" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="اسم المشرفة" value="أ. مريم الأحمد" />
            <InfoField label="وسيلة التواصل" value="واتساب: 09xx xxx xxx" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
