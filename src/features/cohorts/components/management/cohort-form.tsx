/**
 * Cohort Form Component
 *
 * Reusable form for creating and editing cohorts.
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
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCohortSchema, type CreateCohortData } from '../../types';
import type { Level } from '@prisma/client';

interface CohortFormProps {
  /** Form title */
  title: string;
  /** Submit button label */
  submitLabel: string;
  /** Available levels */
  levels: Level[];
  /** Default values for edit mode */
  defaultValues?: CreateCohortData;
  /** Submit handler */
  onSubmit: (data: CreateCohortData) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
}

export function CohortForm({
  title,
  submitLabel,
  levels,
  defaultValues,
  onSubmit,
  onCancel,
}: CohortFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateCohortData>({
    resolver: zodResolver(createCohortSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const handleFormSubmit = (data: CreateCohortData) => {
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

        {success && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-right">
            <p className="text-sm text-emerald-600">تم الحفظ بنجاح!</p>
          </div>
        )}

        {/* Name */}
        <div className="space-y-1">
          <Label className="text-right block">اسم الدفعة</Label>
          <Input
            placeholder="مثال: دفعة 2026"
            className="text-right bg-card"
            dir="rtl"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive text-right">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <Label className="text-right block">تاريخ البداية</Label>
          <Input
            type="date"
            className="text-right bg-card"
            dir="rtl"
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="text-xs text-destructive text-right">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <Label className="text-right block">تاريخ النهاية</Label>
          <Input
            type="date"
            className="text-right bg-card"
            dir="rtl"
            {...register('endDate')}
          />
          {errors.endDate && (
            <p className="text-xs text-destructive text-right">
              {errors.endDate.message}
            </p>
          )}
        </div>

        {/* Current Level */}
        <div className="space-y-1">
          <Label className="text-right block">المستوى الحالي</Label>
          <Controller
            name="currentLevelId"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger className="text-right bg-card w-full" dir="rtl">
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id} dir="rtl">
                      {level.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.currentLevelId && (
            <p className="text-xs text-destructive text-right">
              {errors.currentLevelId.message}
            </p>
          )}
        </div>
      </form>

      <div className="flex gap-2 p-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1"
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isPending || success}
          className="flex-1"
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
