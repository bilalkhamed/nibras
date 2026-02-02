/**
 * Group Form Component
 *
 * Reusable form for creating and editing groups.
 * Pure presentation component - receives data via props, calls action on submit.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
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
import type { UserNameDTO } from '@/features/users/types';
import { CohortListDTO } from '@/features/cohorts';

interface GroupFormProps {
  /** Form title */
  title: string;
  /** Submit button label */
  submitLabel: string;
  /** Available cohorts */
  cohorts: CohortListDTO[];
  /** Available supervisors */
  supervisors: UserNameDTO[];
  /** Default values for edit mode */
  defaultValues?: CreateGroupData;
  /** Submit handler */
  onSubmit: (data: CreateGroupData) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
}

export function GroupForm({
  title,
  submitLabel,
  cohorts,
  supervisors,
  defaultValues,
  onSubmit,
  onCancel,
}: GroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateGroupData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: defaultValues || {
      name: '',
      cohortId: '',
      supervisors: [],
    },
  });

  const handleFormSubmit = (data: CreateGroupData) => {
    startTransition(async () => {
      setError(null);
      try {
        await onSubmit(data);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      }
    });
  };

  const selectedCohortName = cohorts.find(
    (c) => c.id === watch('cohortId'),
  )?.name;
  const selectedSupervisors = watch('supervisors');
  const selectedSupervisorsNames = supervisors
    .filter((s) => selectedSupervisors?.includes(s.id))
    .map((s) => `${s.firstName} ${s.middleName} ${s.lastName}`)
    .join('، ');

  const formName = watch('name');
  const formCohortId = watch('cohortId');
  const formSupervisors = watch('supervisors');

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-right">{title}</h2>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
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
                value={field.value}
                dir="rtl"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الدفعة" />
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
                values={field.value || []}
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
            <AlertTitle>تم الحفظ بنجاح!</AlertTitle>
          </Alert>
        )}

        {/* Confirmation Preview */}
        {!success &&
          formName &&
          formCohortId &&
          formSupervisors &&
          formSupervisors.length > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-right">
              <p className="text-sm text-foreground/90">
                <span className="font-semibold">سيتم الحفظ:</span>
                <br />
                <span className="text-primary font-medium">{formName}</span>
                <br />
                الدفعة <span className="font-medium">
                  {selectedCohortName}
                </span>{' '}
                • المشرفات: <br />{' '}
                <span className="font-medium">{selectedSupervisorsNames}</span>
              </p>
            </div>
          )}
      </form>

      <div className="p-6 border-t border-border flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}
