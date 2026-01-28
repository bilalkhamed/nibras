'use client';

import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, Edit, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { removeStudentFromGroupAction } from '../../actions';

interface StudentActionsProps {
  groupId: string;
  studentId: string;
}

export function StudentActions({ groupId, studentId }: StudentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const result = await removeStudentFromGroupAction(groupId, studentId);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success('تمت إزالة الطالبة من المجموعة بنجاح.');
        router.refresh();
      } catch (error) {
        toast.error('حصل خطأ أثناء إزالة الطالبة من المجموعة.', {
          description: (error as Error)?.message,
        });
      }
    });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/dashboard/users/${studentId}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 text-blue-500" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>عرض الملف الشخصي</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4 text-blue-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>تحرير</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>حذف من المجموعة</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
