'use client';

import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function StudentActions({
  groupId,
  studentId,
}: {
  groupId: string;
  studentId: string;
}) {
  const router = useRouter();

  const handleRemove = async () => {
    console.log('Removing student', studentId, 'from group', groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/students/${studentId}`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error(res.statusText);

      toast.success('تمت إزالة الطالبة من المجموعة بنجاح.');
      router.refresh();
    } catch (error) {
      toast.error('حصل خطأ أثناء إزالة الطالبة من المجموعة.', {
        description: (error as Error)?.message,
      });
    }
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
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>حذف من المجموعة</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
