/**
 * CreateCohortSheet Component
 *
 * Sheet dialog for creating new cohorts.
 * Uses the cohort form and calls the create action.
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
import type { CreateCohortData } from '../../types';
import type { Level } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ServiceReturn } from '@/lib/server/service/types';
import { createCohortAction } from '../../actions/create';

type CreateCohortSheetProps = {
  /** Trigger element (typically a button) */
  children: React.ReactNode;
  /** Optional callback after successful creation */
  onSuccess?: (cohortId: string) => void;
};

/**
 * Sheet component for creating new cohorts
 */
export function CreateCohortSheet({
  children,
  onSuccess,
}: CreateCohortSheetProps) {
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch levels when dialog opens
  useEffect(() => {
    if (!open) return;

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
          throw new Error(`فشل تحميل المستويات: ${result.error.statusCode}`);
        }

        setLevels(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
        console.error('Error fetching levels:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: CreateCohortData) => {
    try {
      const result = await createCohortAction(data);

      if (!result.success) {
        throw new Error(`فشل إنشاء الدفعة: ${result.error.statusCode}`);
      }

      toast.success('تم إنشاء الدفعة بنجاح!');

      // Close after a short delay to show success
      setTimeout(() => {
        setOpen(false);
        if (onSuccess && result.data) {
          onSuccess(result.data.cohortId);
        }
      }, 1500);
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء الدفعة.');
      throw err;
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetTitle className="sr-only">إنشاء دفعة جديدة</SheetTitle>
        <SheetDescription className="sr-only">
          نموذج إنشاء دفعة جديدة
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
            title="إنشاء دفعة جديدة"
            submitLabel="إنشاء الدفعة"
            levels={levels}
            onSubmit={onSubmit}
            onCancel={handleCancel}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
