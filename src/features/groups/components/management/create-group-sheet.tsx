/**
 * CreateGroupSheet Component
 *
 * Sheet dialog for creating new groups.
 * Uses the group form and calls the create action.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2Icon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { GroupForm } from '../management/group-form';
import type { CreateGroupData } from '../../types';
import type { UserNameDTO } from '@/features/users/types';
import { createGroupAction } from '../../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SUPERVISOR_ROLE } from '@/types/types';

interface Cohort {
  id: string;
  name: string;
}

type CreateGroupSheetProps = {
  /** Optional cohort ID restriction for cohort managers */
  cohortId?: string;
};

/**
 * Sheet component for creating new groups
 */
export function CreateGroupSheet({ cohortId }: CreateGroupSheetProps) {
  const [open, setOpen] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [supervisors, setSupervisors] = useState<UserNameDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch data when dialog opens
  useEffect(() => {
    if (!open || dataFetched) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supervisorParams = new URLSearchParams({
          role: SUPERVISOR_ROLE,
          nameOnly: 'true',
        });

        // Always fetch all supervisors and determine cohorts based on cohortId
        const cohortsPromise = cohortId
          ? fetch(`/api/cohorts/${cohortId}`).then((res) => res.json())
          : fetch('/api/cohorts').then((res) => res.json());

        const [supervisorsData, cohortsData] = await Promise.all([
          fetch(`/api/users?${supervisorParams.toString()}`).then((res) =>
            res.json(),
          ),
          cohortsPromise,
        ]);

        setSupervisors(supervisorsData.users || []);

        // Handle single cohort vs multiple cohorts response
        if (cohortId) {
          setCohorts(cohortsData.cohort ? [cohortsData.cohort] : []);
        } else {
          setCohorts(cohortsData.cohorts || []);
        }

        setDataFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, dataFetched, cohortId]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      // Reset data fetching state when closing
      setDataFetched(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: CreateGroupData) => {
    try {
      const res = await createGroupAction(data);

      if (res.success) {
        toast.success('تم إنشاء المجموعة بنجاح!');
        router.refresh();
        // Close after a short delay to show success
        setTimeout(() => {
          setOpen(false);
        }, 1500);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء المجموعة.');
      throw err;
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إنشاء مجموعة جديدة
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetTitle className="sr-only">إنشاء مجموعة جديدة</SheetTitle>
        <SheetDescription className="sr-only">
          نموذج إنشاء مجموعة جديدة
        </SheetDescription>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 h-full">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              جاري تحميل معلومات الدفعة والمشرفات...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <GroupForm
            title="إنشاء مجموعة جديدة"
            submitLabel="إنشاء المجموعة"
            cohorts={cohorts}
            supervisors={supervisors}
            onSubmit={onSubmit}
            onCancel={handleCancel}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
