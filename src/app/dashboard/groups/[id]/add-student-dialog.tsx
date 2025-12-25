'use client';

import { useEffect, useState } from 'react';
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
import SearchSelect from '@/components/search-select';
import { UserPlus, Loader2Icon, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { STUDENT_ROLE } from '@/types/types';
import { useRouter } from 'next/navigation';

type Student = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

export default function AddStudentDialog({
  groupId,
  cohortId,
  cohortName,
}: {
  groupId: string;
  cohortId: string;
  cohortName: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // Simulate fetching available students
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
          throw new Error('Failed to fetch supervisors');
        }

        const data = await response.json();
        setStudents(data.users);
      } catch (err) {
        toast.error('حدث خطأ أثناء تحميل الطالبات.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [open]);

  const handleReset = () => {
    setSelectedStudentId('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add student to group');
      }

      router.refresh();
      handleReset();
      setOpen(false);
      toast.success('تم إضافة الطالبة للمجموعة بنجاح!', {
        duration: 2000,
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة الطالبة. الرجاء المحاولة مرة أخرى.', {
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex gap-1">
          <UserPlus className="h-4 w-4 ml-2" />
          إضافة طالبة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px ]">
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
                  options={students.map((student: any) => ({
                    id: student.id,
                    label: `${student.firstName} ${student.middleName} ${student.lastName}`,
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
                <Button variant="outline" disabled={isSubmitting}>
                  إلغاء
                </Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={!selectedStudentId || isSubmitting}
              >
                {isSubmitting ? (
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
