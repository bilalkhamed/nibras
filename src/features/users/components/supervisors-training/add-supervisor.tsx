'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from '@/components/ui/multi-select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateMultipleSupervisorsStatusAction } from '../../actions';
import type { UserBasicDTO } from '../../types';

interface AddSupervisorProps {
  children: React.ReactNode;
}

export function AddSupervisorsDialogue({ children }: AddSupervisorProps) {
  const [open, setOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<UserBasicDTO[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch supervisors when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchSupervisors = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/users?role=supervisor', {
          method: 'GET',
        });

        if (!response.ok) {
          toast.error('فشل في تحميل المشرفات');
          return;
        }

        const data = await response.json();
        setSupervisors(data.users || []);
      } catch (error) {
        console.error('Error fetching supervisors:', error);
        toast.error('حدث خطأ أثناء تحميل المشرفات');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSupervisors();
  }, [open]);

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error('اختاري مشرفة واحدة على الأقل');
      return;
    }

    startTransition(async () => {
      const result = await updateMultipleSupervisorsStatusAction({
        supervisorIds: selectedIds,
        newStatus: 'in_training',
      });

      if (result.success) {
        toast.success('تم إضافة المشرفات بنجاح');
        setSelectedIds([]);
        setOpen(false);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة مشرفات للتدريب</DialogTitle>
          <DialogDescription>
            اختاري المشرفات التي تريدين إضافتهن لبرنامج التدريب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : supervisors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                لا توجد مشرفات متاحة
              </p>
            </div>
          ) : (
            <MultiSelect values={selectedIds} onValuesChange={setSelectedIds}>
              <MultiSelectTrigger disabled={isFetching}>
                <MultiSelectValue placeholder="اختاري المشرفات" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                {supervisors.map((supervisor) => {
                  const displayName = `${supervisor.firstName} ${
                    supervisor.middleName ? supervisor.middleName + ' ' : ''
                  }${supervisor.lastName}`;
                  return (
                    <MultiSelectItem
                      key={supervisor.id}
                      value={supervisor.id}
                      badgeLabel={displayName}
                    >
                      {displayName}
                    </MultiSelectItem>
                  );
                })}
              </MultiSelectContent>
            </MultiSelect>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الإضافة...
              </>
            ) : (
              'إضافة'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
