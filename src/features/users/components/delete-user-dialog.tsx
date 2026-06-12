/**
 * DeleteUserDialog Component
 *
 * Alert dialog for confirming a permanent user account deletion.
 * Styled identically to ResetUserDialog / DeleteCohortDialog.
 *
 * Supports two modes:
 *  - Controlled: pass `open` + `onOpenChange` (no children) — driven by parent.
 *  - Uncontrolled: pass `children` as the trigger — manages its own open state.
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
import { deleteUserAction } from '../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

type DeleteUserDialogProps =
  | {
      /** Controlled mode — parent manages open state, no trigger child needed. */
      open: boolean;
      onOpenChange: (open: boolean) => void;
      children?: never;
      userId: string;
      userName: string;
    }
  | {
      /** Uncontrolled mode — renders children as the AlertDialog trigger. */
      open?: never;
      onOpenChange?: never;
      children: React.ReactNode;
      userId: string;
      userName: string;
    };

export function DeleteUserDialog({
  children,
  userId,
  userName,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Resolve whether we are in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAction(userId);

      if (!result.success) {
        throw new Error(result.error || 'فشل حذف المستخدم');
      }

      toast.success('تم حذف المستخدم بنجاح!');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المستخدم.');
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Only render a Trigger in uncontrolled mode */}
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent className="sm:max-w-105 gap-8">
        <AlertDialogHeader className="flex flex-col items-center! gap-2 text-center sm:text-center">
          {/* Icon Visual */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2 ring-8 ring-destructive/5 animate-pulse zoom-in-50 duration-300">
            <Trash2 className="h-8 w-8" />
          </div>

          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            حذف المستخدم نهائياً
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
            أنت على وشك حذف حساب{' '}
            <span className="font-bold text-foreground mx-1">{userName}</span>{' '}
            بشكل نهائي.
            <br />
            سيتم{' '}
            <span className="text-destructive font-medium">
              حذف جميع بياناتهم
            </span>{' '}
            بما فيها الملف الشخصي، المجموعات، التقدم، التكاليف، والمقالات.
            <br />
            <span className="text-xs mt-2 block font-semibold text-destructive">
              هذا الإجراء لا يمكن التراجع عنه.
            </span>
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
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              <>نعم، احذف نهائياً</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
