/**
 * EditGroupSheet Component
 *
 * Sheet dialog for editing existing groups.
 * Uses the group form and calls the update action.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EditIcon, Loader2Icon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { GroupForm } from './group-form';
import type { CreateGroupData, GroupSupervisorDTO } from '../../types';
import type { UserNameDTO } from '@/features/users/types';
import { updateGroupAction } from '../../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SUPERVISOR_ROLE, GROUP_MANAGER_ROLE } from '@/types/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Cohort {
  id: string;
  name: string;
}

type EditGroupSheetProps = {
  /** Group ID to edit */
  groupId: string;
  /** Default values from existing group */
  defaultValues: CreateGroupData & {
    supervisorsDetails: GroupSupervisorDTO[];
    managerDetails?: UserNameDTO;
  };
  /** Optional cohort ID restriction for cohort managers */
  cohortId?: string;
};

/**
 * Sheet component for editing existing groups
 */
export function EditGroupSheet({
  groupId,
  defaultValues,
  cohortId,
}: EditGroupSheetProps) {
  const [open, setOpen] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [supervisors, setSupervisors] = useState<GroupSupervisorDTO[]>([]);
  const [groupManagers, setGroupManagers] = useState<UserNameDTO[]>([]);
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
          groupStatus: 'inactive',
          nameOnly: 'true',
        });

        const groupManagerParams = new URLSearchParams({
          role: GROUP_MANAGER_ROLE,
          nameOnly: 'true',
        });

        // Always fetch all supervisors and determine cohorts based on cohortId
        const cohortsPromise = cohortId
          ? fetch(`/api/cohorts/${cohortId}`).then((res) => res.json())
          : fetch('/api/cohorts').then((res) => res.json());

        const [supervisorsData, groupManagersData, cohortsData] =
          await Promise.all([
            fetch(`/api/users?${supervisorParams.toString()}`).then((res) =>
              res.json(),
            ),
            fetch(`/api/users?${groupManagerParams.toString()}`).then((res) =>
              res.json(),
            ),
            cohortsPromise,
          ]);

        setSupervisors([
          ...supervisorsData.users,
          ...defaultValues.supervisorsDetails,
        ]);

        // Merge fetched managers with existing manager (union without duplicates)
        const fetchedManagers = groupManagersData.users || [];
        const existingManager = defaultValues.managerDetails;

        // Create a union: if existing manager exists and is not in fetched list, add it
        const managersUnion = existingManager
          ? [
              ...fetchedManagers,
              ...(fetchedManagers.some(
                (m: UserNameDTO) => m.id === existingManager.id,
              )
                ? []
                : [existingManager]),
            ]
          : fetchedManagers;

        setGroupManagers(managersUnion);

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
  }, [
    open,
    dataFetched,
    cohortId,
    defaultValues.supervisorsDetails,
    defaultValues.managerDetails,
  ]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: CreateGroupData) => {
    try {
      const res = await updateGroupAction(groupId, data);

      if (res.success) {
        toast.success('تم تحديث المجموعة بنجاح.');
        router.refresh();
        setOpen(false);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث المجموعة.');
      throw err;
    }
  };

  console.log(supervisors);
  return (
    <Tooltip>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <EditIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>تحرير المجموعة</TooltipContent>
        <SheetContent side="left" className="w-screen p-0 flex flex-col">
          <SheetTitle className="sr-only">
            تعديل {defaultValues.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            نموذج تعديل معلومات المجموعة
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
              title={`تعديل ${defaultValues.name}`}
              submitLabel="حفظ التعديلات"
              cohorts={cohorts}
              supervisors={supervisors}
              groupManagers={groupManagers}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onCancel={handleCancel}
            />
          )}
        </SheetContent>
      </Sheet>
    </Tooltip>
  );
}
