'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { Button } from '@/components/ui/button';
import SearchSelect from '@/components/common/search-select';
import { UserPlus, Loader2Icon, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { STUDENT_ROLE } from '@/types/types';
import { useRouter } from 'next/navigation';
import { addStudentToGroupAction } from '../../actions';

type Student = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

interface AddStudentDialogProps {
  groupId: string;
  cohortId: string;
  cohortName: string;
}

export function AddStudentDialog({
  groupId,
  cohortId,
  cohortName,
}: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [students, setStudents] = useState<Student[]>();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    setIsLoading(true);
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const searchParams = new URLSearchParams({
          role: STUDENT_ROLE,
          cohortId: cohortId,
          groupStatus: 'inactive',
        });

        const response = await fetch(`/api/users?${searchParams.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        setStudents(data.users);
      } catch {
        toast.error('حدث خطأ أثناء تحميل الطالبات.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [open, cohortId]);

  const handleReset = () => {
    setSelectedStudentId('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const result = await addStudentToGroupAction(
          groupId,
          selectedStudentId,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        router.refresh();
        handleReset();
        setOpen(false);
        toast.success('تم إضافة الطالبة للمجموعة بنجاح!', {
          duration: 2000,
        });
      } catch {
        toast.error('حدث خطأ أثناء إضافة الطالبة. الرجاء المحاولة مرة أخرى.', {
          duration: 2000,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex gap-1">
          <UserPlus className="h-4 w-4 ml-2" />
          إضافة طالبة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة طالبة للمجموعة</DialogTitle>
          <DialogDescription className="text-right text-muted-foreground">
            ابحثي عن طالبة واختاريها لإضافتها للمجموعة.
            <br />
            ملاحظة: يمكنك إضافة الطالبات في {cohortName} فقط.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-4 gap-2 flex-col">
            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">جاري تحميل الطالبات...</p>
          </div>
        )}

        {!isLoading && students && students.length === 0 && (
          <Alert variant="warning" className="my-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>لا توجد طالبات متاحات للإضافة</AlertTitle>
            <AlertDescription>
              جميع الطالبات مسجلات في مجموعات حالياً.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && students && students.length > 0 && (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <SearchSelect
                  options={students.map((student) => ({
                    id: student.id,
                    label: `${student.firstName} ${student.middleName ?? ''} ${student.lastName}`,
                  }))}
                  value={selectedStudentId}
                  onChange={setSelectedStudentId}
                  placeholder="اختر الطالبة"
                  searchPlaceholder="ابحثي عن الطالبة..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  إلغاء
                </Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={!selectedStudentId || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2Icon className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  'إضافة الطالبة'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
