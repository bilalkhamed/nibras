import getAuthSession from '@/lib/server/auth-session';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, LogIn, LayoutDashboard, ArrowRight } from 'lucide-react';
import { BackButton } from '@/components/common/back-button';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-background via-muted to-background px-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* 404 Large Display */}
        <div className="space-y-4">
          <div className="text-8xl font-bold bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-4xl font-bold text-foreground">عذراً!</h1>
          <p className="text-lg text-muted-foreground">
            يبدو أن الصفحة التي تبحثين عنها غير موجودة أو تم حذفها.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-5 w-5" />
              الرئيسية
            </Link>
          </Button>

          <div className="text-sm pt-2 my-2">
            <BackButton />
          </div>
        </div>

        {/* Reassuring message */}
        <div className="rounded-lg bg-primary/5 backdrop-blur-sm border border-primary/20 p-4 text-sm text-muted-foreground">
          <p>إذا كنتِ تعتقدين أن هذا خطأ، يرجى التواصل مع الدعم الفني.</p>
        </div>
      </div>
    </div>
  );
}
