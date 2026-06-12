/**
 * DeleteGroupDialog Component
 *
 * Modern alert dialog for confirming group deletion with visual cues.
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
import { deleteGroupAction } from '../../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DeleteGroupDialogProps = {
  children: React.ReactNode;
  groupId: string;
  groupName: string;
};

export function DeleteGroupDialog({
  children,
  groupId,
  groupName,
}: DeleteGroupDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteGroupAction(groupId);

      if (!result.success) {
        throw new Error(result.error || 'فشل حذف المجموعة');
      }

      toast.success('تم حذف المجموعة بنجاح!');
      setOpen(false);
      router.refresh();
      router.push('/dashboard/groups');
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المجموعة.');
      console.error('Error deleting group:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <AlertDialogTrigger asChild>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
        </AlertDialogTrigger>
        <TooltipContent>
          <p>حذف المجموعة</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialogContent className="sm:max-w-105 gap-8">
        <AlertDialogHeader className="flex flex-col items-center! gap-2 text-center sm:text-center">
          {/* Modern Icon Visual */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2 ring-8 ring-destructive/5 animate-pulse zoom-in-50 duration-300">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            حذف المجموعة نهائياً
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
            أنت على وشك حذف{' '}
            <span className="font-bold text-foreground mx-1">{groupName}</span>
            .
            <br />
            هذا الإجراء{' '}
            <span className="text-destructive font-medium">
              لا يمكن التراجع عنه
            </span>
            ، وسيؤدي إلى إزالة جميع الجداول والبيانات المرتبطة بهذه المجموعة.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center flex flex-col! gap-3 w-full sm:space-x-0">
          <AlertDialogCancel disabled={isDeleting} className="w-full h-10 m-0">
            تراجع
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            variant={'destructive'}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              'نعم، احذف المجموعة'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
