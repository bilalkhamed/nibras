import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

const statusMessages: {
  [key: number]: { title: string; description: string };
} = {
  400: {
    title: 'رمز الدعوة غير صحيح',
    description:
      'قد يكون الرمز منتهيًا أو مكتوبًا بشكل خاطئ. تواصلي مع الإدارة لطلب المساعدة.',
  },
  409: {
    title: 'تم استخدام رمز الدعوة',
    description:
      'تم استخدام رمز الدعوة هذا بالفعل. يرجى التواصل مع الإدارة لطلب رمز جديد.',
  },
  410: {
    title: 'انتهت صلاحية رمز الدعوة',
    description:
      'انتهت صلاحية رمز الدعوة هذا. يرجى التواصل مع الإدارة لطلب رمز جديد.',
  },
  429: {
    title: 'لقد تجاوزت الحد المسموح من المحاولات',
    description:
      'تم قفل رمز الدعوة بسبب العديد من المحاولات غير الصالحة. تواصلي مع الإدارة لطلب المساعدة.',
  },
  500: {
    title: 'عذرًا!',
    description:
      'عذرًا! حدث خطأ غير متوقع أثناء التحقق من الدعوة. يرجى المحاولة لاحقًا.',
  },
};

export function InvalidInvite({ status }: { status: number }) {
  return (
    <Card className="border-border shadow-2xl backdrop-blur bg-card/90">
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertTitle className="text-lg font-semibold flex justify-center items-center gap-2 mb-3">
            <TriangleAlert className="sc" />
            {statusMessages[status].title || 'تعذر التحقق من رمز الدعوة'}
          </AlertTitle>
          <AlertDescription>
            <p>
              {statusMessages[status].description ||
                'يرجى التحقق من رمز الدعوة والمحاولة مرة أخرى، أو التواصل مع الإدارة لطلب المساعدة.'}
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
