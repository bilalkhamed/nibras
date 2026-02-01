'use client';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, CheckIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SUPERVISOR_ROLE } from '@/types/types';
import { createGroupAction } from '../../actions';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGroupSchema, type CreateGroupData } from '../../types';

interface Supervisor {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

interface Cohort {
  id: string;
  name: string;
}

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  // Data state
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateGroupData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      cohortId: '',
      supervisors: [],
    },
  });

  // Lazy load data when dialog opens
  useEffect(() => {
    if (!open || dataFetched) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams({
          role: SUPERVISOR_ROLE,
          nameOnly: 'true',
        });

        // Parallel fetching
        const [supervisorsRes, cohortsRes] = await Promise.all([
          fetch(`/api/users?${searchParams.toString()}`),
          fetch('/api/cohorts'),
        ]);

        if (!supervisorsRes.ok) throw new Error('Failed to fetch supervisors');
        if (!cohortsRes.ok) throw new Error('Failed to fetch cohorts');

        const supervisorsData = await supervisorsRes.json();
        const cohortsData = await cohortsRes.json();

        setSupervisors(supervisorsData.users);
        setCohorts(cohortsData.cohorts);
        setDataFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, dataFetched]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      setSuccess(false);
      setError(null);
    }
  };

  const onSubmit = (data: CreateGroupData) => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await createGroupAction(data);

        if (!result.success) {
          throw new Error(result.error);
        }

        setSuccess(true);
        router.refresh();
        toast.success('تم إنشاء المجموعة بنجاح!', {
          duration: 2000,
        });

        // Close after a short delay to show success
        setTimeout(() => {
          setOpen(false);
          reset();
          setSuccess(false);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  const selectedCohortName = cohorts.find(
    (c) => c.id === watch('cohortId'),
  )?.name;
  const selectedSupervisors = watch('supervisors');
  const selectedSupervisorsNames = supervisors
    .filter((s) => selectedSupervisors.includes(s.id))
    .map((s) => `${s.firstName} ${s.middleName} ${s.lastName}`)
    .join('، ');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إنشاء مجموعة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-right">إنشاء مجموعة جديدة</DialogTitle>
          <DialogDescription className="text-right text-muted-foreground">
            أضيفي معلومات المجموعة الجديدة وحددي المشرفات.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">جاري التحميل...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-right">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-right block">اسم المجموعة</Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    placeholder="مثال: مجموعة النور"
                    className="text-right"
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="text-right text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Cohort */}
            <div className="space-y-1 w-full">
              <Label className="text-right block">الدفعة</Label>
              <Controller
                control={control}
                name="cohortId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    dir="rtl"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر الدفعة" className="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card text-foreground border border-border">
                      {cohorts.map((cohort) => (
                        <SelectItem
                          key={cohort.id}
                          value={cohort.id}
                          className="cursor-pointer"
                        >
                          {cohort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cohortId && (
                <p className="text-right text-sm text-destructive">
                  {errors.cohortId.message}
                </p>
              )}
            </div>

            {/* Supervisors MultiSelect */}
            <div className="space-y-1">
              <Label className="text-right block">المشرفات</Label>
              <Controller
                control={control}
                name="supervisors"
                render={({ field }) => (
                  <MultiSelect
                    values={field.value}
                    onValuesChange={field.onChange}
                  >
                    <MultiSelectTrigger className="w-full">
                      <MultiSelectValue placeholder="اختر المشرفات" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {supervisors.map((supervisor) => (
                          <MultiSelectItem
                            key={supervisor.id}
                            value={supervisor.id}
                          >
                            {`${supervisor.firstName} ${supervisor.middleName} ${supervisor.lastName}`}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectContent>
                  </MultiSelect>
                )}
              />
              {errors.supervisors && (
                <p className="text-right text-sm text-destructive">
                  {errors.supervisors.message}
                </p>
              )}
            </div>

            {success && (
              <Alert variant="success" className="mx-auto">
                <CheckIcon className="h-5 w-5 text-success" />
                <AlertTitle>تم إنشاء المجموعة بنجاح!</AlertTitle>
              </Alert>
            )}

            {/* Confirmation Preview */}
            {!success &&
              watch('name') &&
              watch('cohortId') &&
              watch('supervisors').length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-right">
                  <p className="text-sm text-foreground/90">
                    <span className="font-semibold">سيتم إضافة:</span>
                    <br />
                    <span className="text-primary font-medium">
                      {watch('name')}
                    </span>
                    <br />
                    الدفعة{' '}
                    <span className="font-medium">{selectedCohortName}</span> •
                    المشرفات: <br />{' '}
                    <span className="font-medium">
                      {selectedSupervisorsNames}
                    </span>
                  </p>
                </div>
              )}

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  إلغاء
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending || !dataFetched}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء المجموعة'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
