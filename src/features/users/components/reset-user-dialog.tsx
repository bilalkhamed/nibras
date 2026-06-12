/**
 * ResetUserDialog Component
 *
 * Alert dialog for confirming a user account reset.
 * Styled identically to DeleteCohortDialog.
 */

'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { resetUserAction } from '../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';

type ResetUserDialogProps = {
  children: React.ReactNode;
  userId: string;
  userName: string;
};

export function ResetUserDialog({
  children,
  userId,
  userName,
}: ResetUserDialogProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const result = await resetUserAction(userId);

      if (!result.success) {
        throw new Error(result.error || 'فشل إعادة تعيين المستخدم');
      }

      toast.success('تمت إعادة تعيين المستخدم بنجاح!');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء إعادة تعيين المستخدم.');
      console.error('Error resetting user:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-105 gap-8">
        <AlertDialogHeader className="flex flex-col items-center! gap-2 text-center sm:text-center">
          {/* Icon Visual */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning mb-2 ring-8 ring-warning/5 animate-pulse zoom-in-50 duration-300">
            <RotateCcw className="h-8 w-8" />
          </div>

          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            إعادة تعيين حساب المستخدم
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
            أنت على وشك إعادة تعيين حساب{' '}
            <span className="font-bold text-foreground mx-1">{userName}</span>.
            <br />
            سيتم{' '}
            <span className="text-warning font-medium">
              حذف بيانات تسجيل الدخول
            </span>{' '}
            (البريد الإلكتروني، اسم المستخدم، كلمة المرور) وإعادة الحساب إلى
            حالة{' '}
            <span className="text-secondary font-medium">مدعوّة</span>.
            <br />
            <span className="text-xs mt-2 block">
              جميع البيانات الأخرى (الملف الشخصي، التقدم، المجموعات) ستُحفظ.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center flex flex-col! gap-3 w-full sm:space-x-0">
          <AlertDialogCancel disabled={isResetting} className="w-full h-10 m-0">
            تراجع
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={isResetting}
            className="w-full h-10 gap-2 font-medium bg-warning text-warning-foreground hover:bg-warning/90 transition-all shadow-sm hover:shadow-md"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري إعادة التعيين...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                نعم، أعد التعيين
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
