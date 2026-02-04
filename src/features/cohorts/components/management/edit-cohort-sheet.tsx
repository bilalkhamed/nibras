/**
 * EditCohortSheet Component
 *
 * Sheet dialog for editing existing cohorts.
 * Uses the cohort form and calls the update action.
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CohortForm } from './cohort-form';
import type { CreateCohortData, CohortListDetailedDTO } from '../../types';
import type { Level } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateCohortAction } from '../../actions';
import { ServiceReturn } from '@/lib/server/service/types';

type EditCohortSheetProps = {
  /** Trigger element (typically a button) */
  children: React.ReactNode;
  /** Cohort to edit */
  cohort: CohortListDetailedDTO;
  /** Optional callback after successful update */
  onSuccess?: (cohortId: string) => void;
};

/**
 * Sheet component for editing cohorts
 */
export function EditCohortSheet({
  children,
  cohort,
  onSuccess,
}: EditCohortSheetProps) {
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch levels when dialog opens
  useEffect(() => {
    if (!open || dataFetched) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/levels');

        if (!response.ok) {
          throw new Error('فشل تحميل المستويات');
        }

        const result: ServiceReturn<Level[]> = await response.json();

        if (!result.success) {
          throw new Error(`فشل تحميل المستويات: ${result.error?.statusCode}`);
        }

        setLevels(result.data || []);
        setDataFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
        console.error('Error fetching levels:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, dataFetched]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      setDataFetched(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: CreateCohortData) => {
    try {
      const result = await updateCohortAction(cohort.id, data);

      if (!result.success) {
        throw new Error(result.error || 'فشل تحديث الدفعة');
      }

      toast.success('تم تحديث الدفعة بنجاح!');

      if (onSuccess && result.cohortId) {
        onSuccess(result.cohortId);
      }

      setOpen(false);
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث الدفعة.');
      throw err;
    }
  };

  const defaultValues: CreateCohortData = {
    name: cohort.name,
    startDate: cohort.startDate.toISOString().split('T')[0],
    endDate: cohort.endDate
      ? cohort.endDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    currentLevelId: cohort.currentLevel.id,
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetTitle className="sr-only">تعديل الدفعة</SheetTitle>
        <SheetDescription className="sr-only">
          نموذج تعديل الدفعة
        </SheetDescription>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 h-full">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              جاري تحميل المستويات...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <CohortForm
            title="تعديل الدفعة"
            submitLabel="حفظ التغييرات"
            levels={levels}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onCancel={handleCancel}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
