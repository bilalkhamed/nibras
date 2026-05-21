'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLevelSchema, type CreateLevelData } from '../../types';

interface LevelFormProps {
  title: string;
  submitLabel: string;
  defaultValues?: CreateLevelData;
  onSubmit: (data: CreateLevelData) => Promise<void>;
  onCancel: () => void;
}

export function LevelForm({
  title,
  submitLabel,
  defaultValues,
  onSubmit,
  onCancel,
}: LevelFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateLevelData>({
    resolver: zodResolver(createLevelSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const handleFormSubmit = (data: CreateLevelData) => {
    startTransition(async () => {
      setError(null);
      try {
        await onSubmit(data);
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

        <div className="space-y-1">
          <Label className="text-right block">رقم المستوى</Label>
          <Input
            type="number"
            placeholder="مثال: 1"
            className="text-right bg-card"
            dir="rtl"
            {...register('number', { valueAsNumber: true })}
          />
          {errors.number && (
            <p className="text-xs text-destructive text-right">
              {errors.number.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-right block">عنوان المستوى</Label>
          <Input
            placeholder="مثال: الأول الثانوي"
            className="text-right bg-card"
            dir="rtl"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-xs text-destructive text-right">
              {errors.title.message}
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
          disabled={isPending}
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
