import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const metadata = {
  title: '403 — غير مسموح',
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6 border-border bg-card/90 backdrop-blur">
        <Alert className="mb-4">
          {/* simple inline lock icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9zm3 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
          <AlertTitle>403 — غير مسموح</AlertTitle>
          <AlertDescription>
            <p>ليست لديك صلاحية للوصول إلى هذه الصفحة.</p>
            <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الإدارة.</p>
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/account">
            <Button>العودة إلى الحساب</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">الذهاب إلى الصفحة الرئيسية</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
