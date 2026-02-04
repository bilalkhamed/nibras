/**
 * DeleteCohortDialog Component
 *
 * Modern alert dialog for confirming cohort deletion with visual cues.
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
import { deleteCohortAction } from '../../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

type DeleteCohortDialogProps = {
  children: React.ReactNode;
  cohortId: string;
  cohortName: string;
};

export function DeleteCohortDialog({
  children,
  cohortId,
  cohortName,
}: DeleteCohortDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCohortAction(cohortId);

      if (!result.success) {
        throw new Error(result.error || 'فشل حذف الدفعة');
      }

      toast.success('تم حذف الدفعة بنجاح!');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف الدفعة.');
      console.error('Error deleting cohort:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[420px] gap-8">
        <AlertDialogHeader className="flex flex-col items-center gap-2 text-center sm:text-center">
          {/* Modern Icon Visual */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2 ring-8 ring-destructive/5 animate-in zoom-in-50 duration-300">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            حذف الدفعة نهائياً
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
            أنت على وشك حذف{' '}
            <span className="font-bold text-foreground mx-1">{cohortName}</span>
            .
            <br />
            هذا الإجراء{' '}
            <span className="text-destructive font-medium">
              لا يمكن التراجع عنه
            </span>
            ، وسيؤدي إلى إزالة جميع الجداول والبيانات المرتبطة بهذه الدفعة.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center flex-col-reverse sm:flex-col-reverse gap-3 w-full sm:space-x-0">
          <AlertDialogCancel disabled={isDeleting} className="w-full m-0">
            إلغاء الأمر
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 h-10 font-medium transition-all shadow-sm hover:shadow-md"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              'نعم، احذف الدفعة'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
