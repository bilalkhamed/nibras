'use client';

import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteLevelAction } from '../../actions';
import { ServiceError } from '@/lib/server/service/types';

interface DeleteLevelDialogProps {
  levelId: string;
  levelTitle: string;
}

export function DeleteLevelDialog({ levelId }: DeleteLevelDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteLevelAction(levelId);

        if (!result.success) {
          throw new ServiceError(result.error);
        }

        toast.success('تم حذف المستوى بنجاح');
        setOpen(false);
      } catch (error) {
        if (error instanceof ServiceError) {
          if (error.serviceError.statusCode === 409) {
            toast.error('تعذر حذف المستوى لأنه مرتبط ببيانات أخرى.', {
              duration: 3000,
            });
            return;
          }
        }
        toast.error('حدث خطأ أثناء حذف المستوى');
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">
            هل أنت متأكد من حذف هذا المستوى؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            سيتم حذف المستوى بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse sm:justify-start">
          <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            size={'sm'}
            className="ml-2"
          >
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              'حذف المستوى'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
