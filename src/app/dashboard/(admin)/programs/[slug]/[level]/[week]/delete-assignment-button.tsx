'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteAssignment } from '@/lib/server/actions';

export function DeleteAssignmentButton({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAssignment(assignmentId);

      if (result.success) {
        toast.success('تم حذف المهمة بنجاح!', { duration: 2000 });
        setOpen(false);
        // router.refresh();
      } else {
        toast.error(result.error || 'حدث خطأ أثناء حذف المهمة', {
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المهمة. الرجاء المحاولة مرة أخرى.', {
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <div className="flex items-center justify-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف المهمة</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>حذف المهمة</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من حذف هذه المهمة؟ هذا الإجراء لا يمكن التراجع عنه
            وسيتم حذف جميع البيانات المرتبطة بها.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              إلغاء
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              'حذف'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
